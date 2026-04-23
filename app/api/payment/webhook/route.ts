import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Order from "@/lib/models/order"
import { verifyWebhookSignature } from "@/lib/payment/razorpay"

type RazorpayWebhookPaymentEntity = {
  id: string
  order_id: string
  method?: string
  error_description?: string
}

type RazorpayWebhookPayload = {
  event: "payment.captured" | "payment.failed" | string
  payload?: {
    payment?: {
      entity?: RazorpayWebhookPaymentEntity
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature")
    if (!signature) {
      return NextResponse.json({ success: false, error: "Missing webhook signature" }, { status: 400 })
    }

    const bodyText = await req.text()
    const isValidSignature = verifyWebhookSignature(bodyText, signature)

    if (!isValidSignature) {
      return NextResponse.json({ success: false, error: "Invalid webhook signature" }, { status: 400 })
    }

    const body = JSON.parse(bodyText) as RazorpayWebhookPayload
    const event = body.event
    const payment = body.payload?.payment?.entity

    if (!payment?.order_id) {
      return NextResponse.json({ success: true, ignored: true }, { status: 200 })
    }

    await connectToDatabase()

    const order = await Order.findOne({ gatewayOrderId: payment.order_id })
    if (!order) {
      return NextResponse.json({ success: true, ignored: true }, { status: 200 })
    }

    if (event === "payment.captured") {
      order.paymentStatus = "paid"
      order.status = "paid"
      order.paymentId = payment.id
      order.paymentError = undefined
      order.paidAt = new Date()
      if (payment.method) {
        order.paymentMethod = payment.method
      }
      await order.save()
    }

    if (event === "payment.failed") {
      order.paymentStatus = "failed"
      order.status = "failed"
      order.paymentId = payment.id
      order.paymentError = payment.error_description || "Payment failed"
      order.failedAt = new Date()
      if (payment.method) {
        order.paymentMethod = payment.method
      }
      await order.save()
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Webhook handling failed"
    console.error("Razorpay webhook error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
