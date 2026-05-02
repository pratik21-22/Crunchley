import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth"
import Order from "@/lib/models/order"
import Product from "@/lib/models/product"
import { createOrderAccessToken, normalizeGuestEmail, normalizeGuestPhone } from "@/lib/order-access"
import { logOrderCreated } from "@/lib/logger"
import type { CreateOrderRequest } from "@/types"

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

function parseNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : NaN
}

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value || "", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
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

  const requestedStatus = mapLegacyFulfillmentStatus(order.fulfillmentStatus)
  const fulfillmentStatus =
    typeof requestedStatus === "string" && FULFILLMENT_STATUS_VALUES.has(requestedStatus)
      ? (requestedStatus as string)
      : order.status === "cancelled"
      ? "cancelled"
      : "placed"

  return { paymentStatus, fulfillmentStatus }
}

function validateOrderPayload(body: unknown): {
  valid: boolean
  message?: string
  payload?: CreateOrderRequest
} {
  if (typeof body !== "object" || body === null) {
    return { valid: false, message: "Invalid request payload" }
  }

  const payload = body as Partial<CreateOrderRequest>

  if (!payload.customer) {
    return { valid: false, message: "Customer details are required" }
  }

  const requiredCustomerFields: Array<keyof CreateOrderRequest["customer"]> = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "address",
    "city",
    "state",
    "pincode",
  ]

  for (const key of requiredCustomerFields) {
    const value = payload.customer[key]
    if (!value || typeof value !== "string" || !value.trim()) {
      return { valid: false, message: `Customer field '${key}' is required` }
    }
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return { valid: false, message: "At least one order item is required" }
  }

  for (const item of payload.items) {
    // price MUST NOT be trusted from client; server will compute
    if (!item.id || !item.name || !item.image || typeof item.quantity === "undefined") {
      return { valid: false, message: "Each order item must include id, name, image and quantity" }
    }
    if (Number(item.quantity) < 1) {
      return { valid: false, message: "Invalid item quantity" }
    }
  }

  // Totals will be computed server-side. Accept discount and shipping if present, else default to 0
  const discount = parseNumber(payload.discount) || 0
  const shipping = parseNumber(payload.shipping) || 0
  if ([discount, shipping].some((n) => Number.isNaN(n) || n < 0)) {
    return { valid: false, message: "Invalid order totals" }
  }

  if (!payload.paymentMethod || typeof payload.paymentMethod !== "string") {
    return { valid: false, message: "Payment method is required" }
  }

  return {
    valid: true,
    payload: {
      customer: {
        firstName: payload.customer.firstName.trim(),
        lastName: payload.customer.lastName.trim(),
        email: normalizeGuestEmail(payload.customer.email),
        phone: payload.customer.phone.trim(),
        phoneNormalized: normalizeGuestPhone(payload.customer.phone),
        address: payload.customer.address.trim(),
        city: payload.customer.city.trim(),
        state: payload.customer.state.trim(),
        pincode: payload.customer.pincode.trim(),
      },
      items: payload.items.map((item) => ({
        ...item,
        id: item.id.trim(),
        name: item.name.trim(),
        image: item.image.trim(),
        slug: item.slug?.trim(),
        flavor: item.flavor?.trim(),
      })),
      // totals are computed server-side; include discount/shipping if provided
      subtotal: 0,
      discount,
      shipping,
      total: 0,
      paymentMethod: payload.paymentMethod.trim(),
    },
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
    const session = await verifyAuthToken(token)

    const body = await req.json()
    const validation = validateOrderPayload(body)

    if (!validation.valid || !validation.payload) {
      return NextResponse.json(
        { success: false, error: validation.message || "Invalid request" },
        { status: 400 }
      )
    }

    const { payload } = validation

    const discountFromPayload = Number(payload.discount) || 0
    const shippingFromPayload = Number(payload.shipping) || 0

    const order = await Order.create({
      userId: session?.userId || undefined,
      userName: session?.name ?? `${payload.customer.firstName} ${payload.customer.lastName}`,
      userEmail: session?.email ?? payload.customer.email,
      customer: payload.customer,
      // Build items using authoritative product prices from DB
      items: [],
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
      paymentMethod: payload.paymentMethod,
      paymentStatus: "pending",
      fulfillmentStatus: "placed",
      status: "placed",
    })

    // Validate products and compute totals (server-side authoritative)
    let computedSubtotal = 0
    const itemsToSave: Array<any> = []
    for (const item of payload.items) {
      const quantity = Number(item.quantity)
      if (!Number.isFinite(quantity) || quantity < 1) {
        return NextResponse.json({ success: false, error: `Invalid quantity for product ${item.id}` }, { status: 400 })
      }

      // Attempt to find product by _id first
      const product = await Product.findById(item.id).lean()
      if (!product) {
        // fallback: try by slug
        const prodBySlug = await Product.findOne({ slug: item.id }).lean()
        if (!prodBySlug) {
          return NextResponse.json({ success: false, error: `Product not found: ${item.id}` }, { status: 400 })
        }
        // use prodBySlug
        const price = Number(prodBySlug.price || 0)
        computedSubtotal += price * quantity
        itemsToSave.push({
          productId: String(prodBySlug._id),
          name: prodBySlug.name,
          price,
          originalPrice: (prodBySlug as any).originalPrice,
          image: prodBySlug.image,
          quantity,
          slug: prodBySlug.slug,
          flavor: item.flavor,
        })
      } else {
        const price = Number(product.price || 0)
        computedSubtotal += price * quantity
        itemsToSave.push({
          productId: String(product._id),
          name: product.name,
          price,
          originalPrice: (product as any).originalPrice,
          image: product.image,
          quantity,
          slug: product.slug,
          flavor: item.flavor,
        })
      }
    }
    const computedTotal = Math.max(0, computedSubtotal - discountFromPayload + shippingFromPayload)

    // Update order with computed items and totals
    order.items = itemsToSave
    order.subtotal = computedSubtotal
    order.discount = discountFromPayload
    order.shipping = shippingFromPayload
    order.total = computedTotal
    await order.save()

    const guestAccessToken = !session
      ? await createOrderAccessToken({
          orderId: String(order._id),
          email: payload.customer.email,
          phone: payload.customer.phone,
        })
      : undefined

    // Log order creation
    logOrderCreated("/api/orders", String(order._id), session?.userId, computedTotal, itemsToSave.length, {
      email: payload.customer.email,
      phone: payload.customer.phone,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: String(order._id),
          checkoutMode: session ? "account" : "guest",
          guestAccessToken,
          status: order.status,
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          total: order.total,
          createdAt: order.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create order"
    console.error("Order create error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
    const session = await verifyAuthToken(token)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const search = req.nextUrl.searchParams.get("search")?.trim()
    const paymentStatus = req.nextUrl.searchParams.get("paymentStatus")?.trim()
    const fulfillmentStatus = req.nextUrl.searchParams.get("fulfillmentStatus")?.trim()
    const sort = req.nextUrl.searchParams.get("sort")?.trim() || "newest"
    const page = parsePositiveInt(req.nextUrl.searchParams.get("page"), 1)
    const pageSize = Math.min(parsePositiveInt(req.nextUrl.searchParams.get("pageSize"), 10), 50)

    const query: Record<string, unknown> = session.role === "admin" ? {} : { userId: session.userId }

    if (session.role === "admin") {
      if (search) {
        query.$or = [
          { _id: /^[a-f\d]{24}$/i.test(search) ? search : undefined },
          { userName: { $regex: search, $options: "i" } },
          { userEmail: { $regex: search, $options: "i" } },
          { "customer.firstName": { $regex: search, $options: "i" } },
          { "customer.lastName": { $regex: search, $options: "i" } },
          { "customer.email": { $regex: search, $options: "i" } },
        ].filter((item) => Object.values(item)[0] !== undefined)
      }

      if (paymentStatus && PAYMENT_STATUS_VALUES.has(paymentStatus)) {
        query.paymentStatus = paymentStatus
      }

      if (fulfillmentStatus && FULFILLMENT_STATUS_VALUES.has(fulfillmentStatus)) {
        query.fulfillmentStatus = fulfillmentStatus
      }
    }

    const sortStage: Record<string, 1 | -1> =
      sort === "oldest"
        ? { createdAt: 1 }
        : sort === "highest"
        ? { total: -1, createdAt: -1 }
        : { createdAt: -1 }

    const skip = (page - 1) * pageSize

    const [orders, total] = await Promise.all([
      Order.find(query).sort(sortStage).skip(skip).limit(pageSize).lean(),
      Order.countDocuments(query),
    ])

    return NextResponse.json(
      {
        success: true,
        data: orders.map((order) => ({
          ...(getSafeStatuses(order) as { paymentStatus: string; fulfillmentStatus: string }),
          id: String(order._id),
          userId: order.userId,
          userName: order.userName,
          userEmail: order.userEmail,
          customer: order.customer,
          itemsCount: order.items.length,
          total: order.total,
          paymentMethod: order.paymentMethod,
          paymentId: order.paymentId,
          status: order.status,
          createdAt: order.createdAt,
        })),
        meta: {
          page,
          pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders"
    console.error("Order fetch error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
