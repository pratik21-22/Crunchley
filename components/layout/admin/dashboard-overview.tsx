"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type ComponentType } from "react"
import {
  ArrowRight,
  BarChart3,
  Box,
  Clock3,
  Package,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { AdminHeader } from "./admin-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type DashboardResponse = {
  success: boolean
  error?: string
  data?: {
    summary: {
      totalOrders: number
      totalRevenue: number
      totalProducts: number
      pendingOrders: number
      deliveredOrders: number
      uniqueCustomers: number
    }
    recentOrders: Array<{
      id: string
      customerName: string
      customerEmail: string
      total: number
      paymentStatus: string
      fulfillmentStatus: string
      createdAt: string
      itemsCount: number
    }>
    lowStockProducts: Array<{
      id: string
      name: string
      slug: string
      price: number
      stock: number
      image: string
      category: string
      updatedAt: string
    }>
    latestCustomers: Array<{
      name: string
      email: string
      orders: number
      lastOrderAt: string
    }>
    chartSeries: Array<{
      date: string
      label: string
      orders: number
      revenue: number
    }>
    topSellingProducts: Array<{
      productId: string
      name: string
      unitsSold: number
      revenue: number
    }>
  }
}

type DashboardData = NonNullable<DashboardResponse["data"]>

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusClass(status: string) {
  switch (status) {
    case "paid":
    case "delivered":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "shipped":
    case "packed":
      return "border-blue-200 bg-blue-50 text-blue-700"
    case "confirmed":
      return "border-slate-200 bg-slate-50 text-slate-700"
    case "failed":
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700"
    default:
      return "border-amber-200 bg-amber-50 text-amber-700"
  }
}

function StatCard({ title, value, description, icon: Icon }: { title: string; value: string; description: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <Card className="group border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">{description}</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-3 text-amber-700 shadow-inner transition-transform duration-300 group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "#f59e0b",
  },
} satisfies ChartConfig

const ordersChartConfig = {
  orders: {
    label: "Orders",
    color: "#2563eb",
  },
} satisfies ChartConfig

function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-9 w-20" />
              <Skeleton className="mt-3 h-3 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
          <CardContent className="p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-4 h-60 w-full rounded-xl" />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
          <CardContent className="p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-4 h-60 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export function DashboardOverview() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/admin/dashboard", { cache: "no-store" })
        const payload = (await response.json()) as DashboardResponse

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.error || "Failed to load dashboard")
        }

        if (active) {
          setData(payload.data)
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard")
          setData(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const quickActions = useMemo(
    () => [
      { title: "View Orders", href: "/admin/orders", icon: ShoppingBag, description: "Track order status and updates" },
      { title: "Manage Products", href: "/admin/products", icon: Package, description: "Add or adjust catalog inventory" },
      { title: "View Customers", href: "/admin/customers", icon: Users, description: "Review recent customer activity" },
      { title: "Business Enquiries", href: "/admin/business-enquiries", icon: Sparkles, description: "Handle wholesale and B2B leads" },
    ],
    []
  )

  const summary = data?.summary
  const topUnits = data?.topSellingProducts?.[0]?.unitsSold || 0

  return (
    <>
      <AdminHeader title="Dashboard" description="Live operations, revenue, and catalog health" />

      <div className="space-y-6 p-4 lg:p-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-amber-900 px-6 py-7 text-white shadow-[0_18px_60px_rgba(15,23,42,0.25)] lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100">
                <BarChart3 className="h-3.5 w-3.5" />
                Crunchley control center
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Modern ecommerce operations in one view.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">
                Monitor orders, revenue, stock pressure, and customer activity without leaving the dashboard.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:w-90">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Revenue</p>
                <p className="mt-2 text-xl font-bold">{loading ? "..." : summary ? formatCurrency(summary.totalRevenue) : "₹0"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Pending</p>
                <p className="mt-2 text-xl font-bold">{loading ? "..." : summary?.pendingOrders ?? 0}</p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <Card className="border-red-200 bg-red-50/70 shadow-sm">
            <CardContent className="p-4 text-sm text-red-700">
              {error}
            </CardContent>
          </Card>
        )}

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Orders"
                value={String(summary?.totalOrders ?? 0)}
                description="All orders in the system"
                icon={ShoppingBag}
              />
              <StatCard
                title="Pending Orders"
                value={String(summary?.pendingOrders ?? 0)}
                description="Awaiting fulfillment"
                icon={Clock3}
              />
              <StatCard
                title="Delivered Orders"
                value={String(summary?.deliveredOrders ?? 0)}
                description="Successfully delivered"
                icon={Box}
              />
              <StatCard
                title="Total Revenue"
                value={formatCurrency(summary?.totalRevenue ?? 0)}
                description="Collected from paid orders"
                icon={BarChart3}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100 transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                    Revenue Chart
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Daily paid revenue for the last 14 days</p>
                </CardHeader>
                <CardContent>
                  {!data?.chartSeries.length ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-muted-foreground">
                      Revenue data will appear once paid orders are recorded.
                    </div>
                  ) : (
                    <ChartContainer config={revenueChartConfig} className="h-64 w-full">
                      <AreaChart data={data.chartSeries} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Area
                          dataKey="revenue"
                          type="monotone"
                          fill="var(--color-revenue)"
                          fillOpacity={0.2}
                          stroke="var(--color-revenue)"
                          strokeWidth={2.5}
                          activeDot={{ r: 5 }}
                        />
                      </AreaChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100 transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                    Orders Chart
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Daily order volume for the last 14 days</p>
                </CardHeader>
                <CardContent>
                  {!data?.chartSeries.length ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-muted-foreground">
                      Orders chart will appear after checkout activity starts.
                    </div>
                  ) : (
                    <ChartContainer config={ordersChartConfig} className="h-64 w-full">
                      <BarChart data={data.chartSeries} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="orders" fill="var(--color-orders)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
          <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100 transition-all duration-300 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <p className="text-sm text-muted-foreground">Latest orders across the store</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders" className="gap-1">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {!data?.recentOrders.length ? (
                <div className="p-8 text-center">
                  <p className="text-sm font-medium text-slate-700">No orders yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">New sales will appear here once customers start checking out.</p>
                  <Button className="mt-4" variant="outline" asChild>
                    <Link href="/admin/products">Review products</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="md:hidden divide-y divide-slate-100">
                    {data.recentOrders.map((order) => (
                      <div key={order.id} className="p-4 transition-colors hover:bg-slate-50/70">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">#{order.id.slice(-8).toUpperCase()}</p>
                            <p className="truncate text-xs text-muted-foreground">{order.customerName}</p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{formatCurrency(order.total)}</p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline" className={getStatusClass(order.paymentStatus)}>{order.paymentStatus}</Badge>
                          <Badge variant="outline" className={getStatusClass(order.fulfillmentStatus)}>{order.fulfillmentStatus}</Badge>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Order</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Fulfillment</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.recentOrders.map((order) => (
                          <TableRow key={order.id} className="transition-colors hover:bg-slate-50/70">
                            <TableCell className="font-semibold text-foreground">#{order.id.slice(-8).toUpperCase()}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">{order.customerName}</p>
                                <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusClass(order.paymentStatus)}>
                                {order.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusClass(order.fulfillmentStatus)}>
                                {order.fulfillmentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100 transition-all duration-300 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Top Selling Products</CardTitle>
                  <p className="text-sm text-muted-foreground">Best performers by units sold</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/products" className="gap-1">
                    Catalog
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {!data?.topSellingProducts.length ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-muted-foreground">
                    Top sellers will appear as soon as orders come in.
                  </div>
                ) : (
                  data.topSellingProducts.map((item) => (
                    <div key={item.productId} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                        <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">{item.unitsSold} sold</Badge>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={cn("h-full rounded-full bg-linear-to-r from-amber-400 to-amber-600 transition-all duration-700")}
                          style={{ width: `${Math.max(10, Math.round((item.unitsSold / Math.max(topUnits, 1)) * 100))}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">Revenue {formatCurrency(item.revenue)}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100 transition-all duration-300 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Low Stock Products</CardTitle>
                  <p className="text-sm text-muted-foreground">Items that need attention soon</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/products" className="gap-1">
                    Manage
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {!data?.lowStockProducts.length ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-muted-foreground">
                    No low-stock products right now.
                  </div>
                ) : (
                  data.lowStockProducts.map((product) => (
                    <div key={product.id} className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100/60">
                      <div className="h-12 w-12 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{product.category}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className={product.stock <= 0 ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
                            {product.stock} left
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatCurrency(product.price)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100 transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <p className="text-sm text-muted-foreground">Common admin tasks</p>
              </CardHeader>
              <CardContent className="grid gap-3">
                {quickActions.map((action) => (
                  <Button key={action.href} variant="outline" asChild className="group h-auto justify-start rounded-2xl px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50/40">
                    <Link href={action.href} className="flex w-full items-center gap-3 text-left">
                      <div className="rounded-xl bg-amber-50 p-2 text-amber-700 transition-transform duration-200 group-hover:scale-110">
                        <action.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100 transition-all duration-300 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Latest Customers</CardTitle>
                  <p className="text-sm text-muted-foreground">Most recent repeat and first-time buyers</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/customers" className="gap-1">
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {!data?.latestCustomers.length ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-muted-foreground">
                    No customer history available yet.
                  </div>
                ) : (
                  data.latestCustomers.map((customer) => (
                    <div key={customer.email} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-3 transition-all duration-200 hover:bg-slate-100/60">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{customer.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{customer.email}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Last order {formatDate(customer.lastOrderAt)}</p>
                      </div>
                      <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">
                        {customer.orders} orders
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}