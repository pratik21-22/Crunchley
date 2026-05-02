import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import { requireAdmin } from "@/lib/middleware"
import Order from "@/lib/models/order"
import Product from "@/lib/models/product"

type DashboardOrder = {
  id: string
  customerName: string
  customerEmail: string
  total: number
  paymentStatus: string
  fulfillmentStatus: string
  createdAt: string
  itemsCount: number
}

type DashboardProduct = {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  image: string
  category: string
  updatedAt: string
}

type DashboardCustomer = {
  name: string
  email: string
  orders: number
  lastOrderAt: string
}

type ChartPoint = {
  date: string
  label: string
  orders: number
  revenue: number
}

type TopSellingProduct = {
  productId: string
  name: string
  unitsSold: number
  revenue: number
}

function toKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function buildChartSeries(
  dailyOrders: Array<{ _id: string; orders: number }>,
  dailyRevenue: Array<{ _id: string; revenue: number }>,
  days = 14
): ChartPoint[] {
  const ordersMap = new Map(dailyOrders.map((item) => [item._id, item.orders]))
  const revenueMap = new Map(dailyRevenue.map((item) => [item._id, item.revenue]))

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))

  const points: ChartPoint[] = []
  for (let index = 0; index < days; index++) {
    const current = new Date(start)
    current.setDate(start.getDate() + index)
    const key = toKey(current)

    points.push({
      date: key,
      label: current.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      orders: ordersMap.get(key) || 0,
      revenue: revenueMap.get(key) || 0,
    })
  }

  return points
}

function formatOrder(order: {
  _id: unknown
  userName?: string
  userEmail?: string
  customer: { firstName: string; lastName: string; email: string }
  total: number
  paymentStatus: string
  fulfillmentStatus: string
  createdAt: Date
  items: unknown[]
}): DashboardOrder {
  return {
    id: String(order._id),
    customerName: order.userName || `${order.customer.firstName} ${order.customer.lastName}`.trim(),
    customerEmail: order.userEmail || order.customer.email,
    total: order.total,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    createdAt: order.createdAt.toISOString(),
    itemsCount: order.items.length,
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    const auth = await requireAdmin(req)
    if (!auth.session) return auth.response!

    const chartStart = new Date()
    chartStart.setHours(0, 0, 0, 0)
    chartStart.setDate(chartStart.getDate() - 13)

    const testFilter = {
      $and: [
        { userEmail: { $not: /test|example\.com|guest|track|cod-/i } },
        { "customer.email": { $not: /test|example\.com|guest|track|cod-/i } }
      ]
    }


    const [ordersCount, pendingOrders, deliveredOrders, revenueResult, productsCount, lowStockProducts, recentOrders, latestCustomers, uniqueCustomerGroups, dailyOrders, dailyRevenue, topSellingProducts] =
      await Promise.all([
        Order.countDocuments(testFilter),
        Order.countDocuments({ ...testFilter, fulfillmentStatus: { $in: ["placed", "packed"] } }),
        Order.countDocuments({ ...testFilter, fulfillmentStatus: "delivered" }),
        Order.aggregate([
          { $match: { ...testFilter, paymentStatus: "paid" } },
          { $group: { _id: null, revenue: { $sum: "$total" } } },
        ]),
        Product.countDocuments({}),
        Product.find({ stock: { $gt: 0, $lt: 25 } }).sort({ stock: 1, updatedAt: -1 }).limit(5).lean(),
        Order.find(testFilter).sort({ createdAt: -1 }).limit(5).lean(),
        Order.aggregate([
          { $match: { ...testFilter, userEmail: { $type: "string", $ne: "" } } },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: "$userEmail",
              name: { $first: "$userName" },
              email: { $first: "$userEmail" },
              orders: { $sum: 1 },
              lastOrderAt: { $first: "$createdAt" },
            },
          },
          { $sort: { lastOrderAt: -1 } },
          { $limit: 5 },
        ]),
        Order.aggregate([
          { $match: { ...testFilter, userEmail: { $type: "string", $ne: "" } } },
          {
            $group: {
              _id: "$userEmail",
            },
          },
        ]),
        Order.aggregate([
          { $match: { ...testFilter, createdAt: { $gte: chartStart } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
          { $match: { ...testFilter, createdAt: { $gte: chartStart }, paymentStatus: "paid" } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              revenue: { $sum: "$total" },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
          { $match: testFilter },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.productId",
              name: { $first: "$items.name" },
              unitsSold: { $sum: "$items.quantity" },
              revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
            },
          },
          { $sort: { unitsSold: -1, revenue: -1 } },
          { $limit: 5 },
        ]),
      ])

    const totalRevenue = revenueResult[0]?.revenue || 0
    const chartSeries = buildChartSeries(
      dailyOrders as Array<{ _id: string; orders: number }>,
      dailyRevenue as Array<{ _id: string; revenue: number }>
    )

    return NextResponse.json(
      {
        success: true,
        data: {
          summary: {
            totalOrders: ordersCount,
            totalRevenue,
            totalProducts: productsCount,
            pendingOrders,
            deliveredOrders,
            uniqueCustomers: uniqueCustomerGroups.length,
          },
          recentOrders: recentOrders.map(formatOrder),
          lowStockProducts: lowStockProducts.map((product) => ({
            id: String(product._id),
            name: product.name,
            slug: product.slug,
            price: product.price,
            stock: product.stock,
            image: product.image,
            category: product.category,
            updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : new Date(product.updatedAt).toISOString(),
          })) as DashboardProduct[],
          latestCustomers: latestCustomers.map((customer) => ({
            name: customer.name || customer.email,
            email: customer.email,
            orders: customer.orders,
            lastOrderAt: customer.lastOrderAt instanceof Date ? customer.lastOrderAt.toISOString() : new Date(customer.lastOrderAt).toISOString(),
          })) as DashboardCustomer[],
          chartSeries,
          topSellingProducts: (topSellingProducts as Array<{ _id: string; name: string; unitsSold: number; revenue: number }>).map((item) => ({
            productId: item._id,
            name: item.name,
            unitsSold: item.unitsSold,
            revenue: item.revenue,
          })) as TopSellingProduct[],
        },
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load dashboard"
    console.error("Admin dashboard error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}