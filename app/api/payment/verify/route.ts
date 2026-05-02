import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth"
import Order from "@/lib/models/order"
import { verifyRazorpaySignature } from "@/lib/payment/razorpay"
import { normalizeGuestEmail, normalizeGuestPhone, verifyOrderAccessToken } from "@/lib/order-access"
import { logPaymentVerified, logPaymentFailure } from "@/lib/logger"
import type { VerifyPaymentRequest } from "@/types"

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
    const session = await verifyAuthToken(token)

    const body = (await req.json()) as Partial<VerifyPaymentRequest>
    const orderId = body.orderId?.trim()
    const guestAccessToken =
      body.guestAccessToken?.trim() || req.headers.get("x-order-access-token")?.trim() || ""

    if (!orderId) {
      return NextResponse.json({ success: false, error: "orderId is required" }, { status: 400 })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const isOwner = session ? order.userId === session.userId : false
    const isAdmin = session?.role === "admin"

    let isGuestAuthorized = false
    if (!session && guestAccessToken) {
      const guestPayload = await verifyOrderAccessToken(guestAccessToken)
      isGuestAuthorized =
        Boolean(guestPayload) &&
        guestPayload?.orderId === String(order._id) &&
        guestPayload?.email === normalizeGuestEmail(order.customer.email) &&
        guestPayload?.phone === normalizeGuestPhone(order.customer.phone)
    }

    if (!isOwner && !isAdmin && !isGuestAuthorized) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    if (body.failureReason) {
      order.paymentStatus = "failed"
      order.status = "failed"
      order.paymentError = body.failureReason
      if (body.paymentMethod) {
        order.paymentMethod = body.paymentMethod
      }
      order.failedAt = new Date()
      await order.save()

      logPaymentFailure("/api/payment/verify", String(order._id), session?.userId, body.failureReason, {
        paymentMethod: body.paymentMethod,
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            orderId: String(order._id),
            status: order.status,
          },
        },
        { status: 200 }
      )
    }

    const razorpayOrderId = body.razorpayOrderId?.trim()
    const razorpayPaymentId = body.razorpayPaymentId?.trim()
    const razorpaySignature = body.razorpaySignature?.trim()

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { success: false, error: "Payment verification payload is incomplete" },
        { status: 400 }
      )
    }

    if (order.gatewayOrderId && order.gatewayOrderId !== razorpayOrderId) {
      return NextResponse.json(
        { success: false, error: "Gateway order does not match" },
        { status: 400 }
      )
    }

    const isSignatureValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    })

    if (!isSignatureValid) {
      order.paymentStatus = "failed"
      order.status = "failed"
      order.paymentError = "Signature verification failed"
      order.failedAt = new Date()
      await order.save()

      logPaymentFailure("/api/payment/verify", String(order._id), session?.userId, "signature_verification_failed", {
        razorpayOrderId,
        razorpayPaymentId,
      })

      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 })
    }

    // Idempotency: atomically mark order paid only if not already paid.
    // If another request already marked it paid, return success without re-processing.
    const paidAt = new Date()
    const updateFields: any = {
      paymentStatus: "paid",
      status: "paid",
      paymentId: razorpayPaymentId,
      gatewayOrderId: razorpayOrderId,
      paymentSignature: razorpaySignature,
      paymentError: undefined,
      paidAt,
    }
    if (body.paymentMethod) {
      updateFields.paymentMethod = body.paymentMethod
    }

    // Try to perform an atomic update only when paymentStatus is not already 'paid'
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: { $ne: "paid" } },
      { $set: updateFields },
      { new: true }
    )

    if (!updated) {
      // Another caller already marked this order as paid. Reload and return existing paid info.
      const current = await Order.findById(order._id)
      return NextResponse.json(
        {
          success: true,
          data: {
            orderId: String(order._id),
            status: current?.status,
            paymentId: current?.paymentId,
            paidAt: current?.paidAt,
          },
        },
        { status: 200 }
      )
    }

    // Successfully marked as paid by this call
    logPaymentVerified("/api/payment/verify", String(updated._id), session?.userId, updated.paymentId || razorpayPaymentId, updated.total, {
      razorpayOrderId: updated.gatewayOrderId,
      paymentMethod: updated.paymentMethod,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: String(updated._id),
          status: updated.status,
          paymentId: updated.paymentId,
          paidAt: updated.paidAt,
        },
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Payment verification failed"
    console.error("Razorpay verify error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
