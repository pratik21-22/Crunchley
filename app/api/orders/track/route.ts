import { Types } from "mongoose"
import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth"
import Order from "@/lib/models/order"

type FulfillmentStep = "placed" | "packed" | "shipped" | "delivered" | "cancelled"

const TRACKING_STEPS: FulfillmentStep[] = ["placed", "packed", "shipped", "delivered", "cancelled"]

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "")
}

function getStatusIndex(status: string): number {
  const index = TRACKING_STEPS.indexOf(status as FulfillmentStep)
  return index >= 0 ? index : 0
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
    const session = await verifyAuthToken(token)

    const body = (await req.json()) as {
      orderId?: string
      email?: string
      phone?: string
    }

    const orderId = body.orderId?.trim() || ""
    const email = body.email?.trim() || ""
    const phone = body.phone?.trim() || ""

    if (!orderId || !Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ success: false, error: "Valid order ID is required" }, { status: 400 })
    }

    if (!session && !email && !phone) {
      return NextResponse.json(
        { success: false, error: "Provide order ID with either email or mobile number" },
        { status: 400 }
      )
    }

    const order = await Order.findById(orderId).lean()

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const normalizedEmail = email ? normalizeEmail(email) : ""
    const normalizedPhone = phone ? normalizePhone(phone) : ""
    const orderEmail = normalizeEmail(order.customer.email)
    const orderPhone = normalizePhone(order.customer.phone)

    const isAdmin = session?.role === "admin"
    const isOwner = session ? order.userId === session.userId : false
    const isGuestMatch =
      (!session || !isOwner) &&
      ((normalizedEmail && normalizedEmail === orderEmail) ||
        (normalizedPhone && normalizedPhone === orderPhone))

    if (!isAdmin && !isOwner && !isGuestMatch) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const currentIndex = getStatusIndex(order.fulfillmentStatus || "placed")
    const timeline = TRACKING_STEPS.map((step, index) => ({
      step,
      completed: index <= currentIndex,
      at: index === 0 ? order.createdAt : index === currentIndex ? order.updatedAt : null,
    }))

    return NextResponse.json(
      {
        success: true,
        data: {
          id: String(order._id),
          total: order.total,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          status: order.status,
          itemsCount: order.items.length,
          createdAt: order.createdAt,
          customer: {
            name: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
            email: order.customer.email,
            phone: order.customer.phone,
            address: order.customer.address,
            pincode: order.customer.pincode,
          },
          timeline,
          accessMode: isAdmin ? "admin" : isOwner ? "account-linked" : "guest-verified",
        },
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to track order"
    console.error("Order tracking error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
