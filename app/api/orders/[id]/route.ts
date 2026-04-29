import { Types } from "mongoose"
import { NextRequest, NextResponse } from "next/server"
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import Order from "@/lib/models/order"
import { normalizeGuestEmail, normalizeGuestPhone, verifyOrderAccessToken } from "@/lib/order-access"

type PaymentStatus = "pending" | "paid" | "failed" | "refunded"
type FulfillmentStatus = "placed" | "packed" | "shipped" | "delivered" | "cancelled"

const FULFILLMENT_FLOW: Record<string, FulfillmentStatus[]> = {
  placed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
}

const PAYMENT_STATUS_VALUES = new Set(["pending", "paid", "failed", "refunded"])
const FULFILLMENT_STATUS_VALUES = new Set([
  "placed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
])

function mapLegacyFulfillmentStatus(value: unknown): string {
  return value === "confirmed" ? "placed" : String(value)
}

type RouteContext = {
  params: Promise<{ id: string }>
}

function getSafeStatuses(order: {
  paymentStatus?: unknown
  fulfillmentStatus?: unknown
  status?: unknown
}) {
  const paymentStatus =
    typeof order.paymentStatus === "string" && PAYMENT_STATUS_VALUES.has(order.paymentStatus)
      ? order.paymentStatus
      : order.status === "paid"
      ? "paid"
      : order.status === "failed"
      ? "failed"
      : "pending"

  const requestedFulfillment = mapLegacyFulfillmentStatus(order.fulfillmentStatus)
  const fulfillmentStatus =
    typeof requestedFulfillment === "string" && FULFILLMENT_STATUS_VALUES.has(requestedFulfillment)
      ? (requestedFulfillment as FulfillmentStatus)
      : order.status === "cancelled"
      ? "cancelled"
      : "placed"

  return { paymentStatus, fulfillmentStatus }
}

function buildOrderResponse(order: {
  _id: unknown
  userId?: string
  userName?: string
  userEmail?: string
  customer: unknown
  items: unknown
  subtotal: number
  discount: number
  shipping: number
  total: number
  paymentMethod: string
  paymentId?: string
  gatewayOrderId?: string
  paymentSignature?: string
  paymentError?: string
  paidAt?: Date
  failedAt?: Date
  status: string
  paymentStatus?: string
  fulfillmentStatus?: string
  createdAt: Date
  updatedAt: Date
}) {
  const statuses = getSafeStatuses(order)

  return {
    id: String(order._id),
    userId: order.userId,
    userName: order.userName,
    userEmail: order.userEmail,
    customer: order.customer,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentId: order.paymentId,
    gatewayOrderId: order.gatewayOrderId,
    paymentSignature: order.paymentSignature,
    paymentError: order.paymentError,
    paidAt: order.paidAt,
    failedAt: order.failedAt,
    status: order.status,
    paymentStatus: statuses.paymentStatus,
    fulfillmentStatus: statuses.fulfillmentStatus,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase()

    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
    const session = await verifyAuthToken(token)

    const { id } = await context.params

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid order id" }, { status: 400 })
    }

    const order = await Order.findById(id).lean()

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const isOwner = session ? order.userId === session.userId : false
    const isAdmin = session?.role === "admin"

    const guestToken =
      req.nextUrl.searchParams.get("guestToken")?.trim() || req.headers.get("x-order-access-token")?.trim() || ""
    let isGuestAuthorized = false
    if (!session && guestToken) {
      const guestPayload = await verifyOrderAccessToken(guestToken)
      isGuestAuthorized =
        Boolean(guestPayload) &&
        guestPayload?.orderId === String(order._id) &&
        guestPayload?.email === normalizeGuestEmail(order.customer.email) &&
        guestPayload?.phone === normalizeGuestPhone(order.customer.phone)
    }

    if (!isOwner && !isAdmin && !isGuestAuthorized) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: buildOrderResponse(order) }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch order"
    console.error("Order detail error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase()

    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
    const session = await verifyAuthToken(token)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const { id } = await context.params

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid order id" }, { status: 400 })
    }

    const body = (await req.json()) as {
      fulfillmentStatus?: string
      paymentStatus?: string
    }

    const nextFulfillmentRaw = body.fulfillmentStatus?.trim()
    const nextPaymentRaw = body.paymentStatus?.trim()

    if (!nextFulfillmentRaw && !nextPaymentRaw) {
      return NextResponse.json(
        { success: false, error: "At least one status update is required" },
        { status: 400 }
      )
    }

    if (nextFulfillmentRaw && !FULFILLMENT_STATUS_VALUES.has(nextFulfillmentRaw)) {
      return NextResponse.json({ success: false, error: "Invalid fulfillment status" }, { status: 400 })
    }

    if (nextPaymentRaw && !PAYMENT_STATUS_VALUES.has(nextPaymentRaw)) {
      return NextResponse.json({ success: false, error: "Invalid payment status" }, { status: 400 })
    }

    const nextFulfillment = nextFulfillmentRaw as FulfillmentStatus | undefined
    const nextPayment = nextPaymentRaw as PaymentStatus | undefined

    const order = await Order.findById(id)

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const currentFulfillment = getSafeStatuses(order).fulfillmentStatus as FulfillmentStatus

    if (nextFulfillment && nextFulfillment !== currentFulfillment) {
      const allowed = FULFILLMENT_FLOW[currentFulfillment] || []
      if (!allowed.includes(nextFulfillment)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid fulfillment transition from '${currentFulfillment}' to '${nextFulfillment}'`,
          },
          { status: 409 }
        )
      }

      order.fulfillmentStatus = nextFulfillment

      if (nextFulfillment === "cancelled") {
        order.status = "cancelled"
      }
    }

    if (nextPayment) {
      order.paymentStatus = nextPayment

      if (nextPayment === "paid") {
        order.status = "paid"
        order.paidAt = order.paidAt || new Date()
        order.paymentError = undefined
      }

      if (nextPayment === "failed") {
        order.status = "failed"
        order.failedAt = new Date()
      }

      if (nextPayment === "pending") {
        if (order.status === "paid" || order.status === "failed") {
          order.status = "placed"
        }
      }
    }

    await order.save()

    return NextResponse.json({ success: true, data: buildOrderResponse(order.toObject()) }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update order"
    console.error("Order update error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase()

    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
    const session = await verifyAuthToken(token)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const { id } = await context.params
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid order id" }, { status: 400 })
    }

    const order = await Order.findByIdAndDelete(id)

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { id } }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete order"
    console.error("Order delete error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
