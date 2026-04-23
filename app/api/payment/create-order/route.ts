import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth"
import Order from "@/lib/models/order"
import {
  createRazorpayClient,
  getRazorpayConfig,
  RAZORPAY_CURRENCY,
  toPaise,
} from "@/lib/payment/razorpay"
import { normalizeGuestEmail, normalizeGuestPhone, verifyOrderAccessToken } from "@/lib/order-access"
import type { CreatePaymentOrderRequest, CreatePaymentOrderResponse } from "@/types"

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
    const session = await verifyAuthToken(token)

    const body = (await req.json()) as Partial<CreatePaymentOrderRequest>
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

    if (order.paymentStatus === "paid" || order.status === "paid") {
      return NextResponse.json({ success: false, error: "Order is already paid" }, { status: 409 })
    }

    const razorpay = createRazorpayClient()
    const amount = toPaise(order.total)

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: RAZORPAY_CURRENCY,
      receipt: `crunchley_${String(order._id).slice(-8)}_${Date.now()}`,
      notes: {
        appOrderId: String(order._id),
        customerEmail: order.customer.email,
      },
    })

    order.gatewayOrderId = razorpayOrder.id
    order.paymentStatus = "pending"
    order.fulfillmentStatus = order.fulfillmentStatus || "placed"
    order.status = "placed"
    order.paymentError = undefined
    await order.save()

    const { keyId } = getRazorpayConfig()
    const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId

    const response: CreatePaymentOrderResponse = {
      orderId: String(order._id),
      amount,
      currency: RAZORPAY_CURRENCY,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: publicKeyId,
    }

    return NextResponse.json({ success: true, data: response }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create payment order"
    console.error("Razorpay create-order error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
