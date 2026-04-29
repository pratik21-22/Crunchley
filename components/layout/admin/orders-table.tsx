"use client"

import { useEffect, useMemo, useState } from "react"
import { Eye, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { FulfillmentStatus, OrderDetail, OrderSummary, PaymentStatus } from "@/types"

type OrdersApiResponse = {
  success: boolean
  error?: string
  data: OrderSummary[]
  meta?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

type OrderDetailApiResponse = {
  success: boolean
  error?: string
  data: OrderDetail
}

const PAYMENT_OPTIONS: Array<{ label: string; value: PaymentStatus | "all" }> = [
  { label: "All Payments", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
]

const FULFILLMENT_OPTIONS: Array<{ label: string; value: FulfillmentStatus | "all" }> = [
  { label: "All Fulfillment", value: "all" },
  { label: "Placed", value: "placed" },
  { label: "Packed", value: "packed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
]

const FULFILLMENT_STATUS_OPTIONS: Array<{ label: string; value: FulfillmentStatus }> = [
  { label: "Placed", value: "placed" },
  { label: "Packed", value: "packed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
]

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Highest Amount", value: "highest" },
] as const

const FULFILLMENT_TRANSITIONS: Record<FulfillmentStatus | "confirmed", FulfillmentStatus[]> = {
  placed: ["packed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
}

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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatOrderId(id: string) {
  return `#${id.slice(-8).toUpperCase()}`
}

function getPaymentBadgeClass(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "border-green-200 bg-green-50 text-green-700"
    case "failed":
      return "border-red-200 bg-red-50 text-red-700"
    case "refunded":
      return "border-purple-200 bg-purple-50 text-purple-700"
    case "pending":
    default:
      return "border-amber-200 bg-amber-50 text-amber-700"
  }
}

function getFulfillmentBadgeClass(status: FulfillmentStatus) {
  switch (status) {
    case "delivered":
      return "border-green-200 bg-green-50 text-green-700"
    case "shipped":
      return "border-blue-200 bg-blue-50 text-blue-700"
    case "packed":
      return "border-indigo-200 bg-indigo-50 text-indigo-700"
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700"
    case "placed":
    default:
      return "border-zinc-200 bg-zinc-100 text-zinc-700"
  }
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function OrdersTable() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("all")
  const [fulfillmentFilter, setFulfillmentFilter] = useState<FulfillmentStatus | "all">("all")
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]["value"]>("newest")
  const [page, setPage] = useState(1)

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [pendingUpdate, setPendingUpdate] = useState<{
    id: string
    current: FulfillmentStatus
    next: FulfillmentStatus
  } | null>(null)
  const [updating, setUpdating] = useState(false)

  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchInput])

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("pageSize", "10")
    params.set("sort", sortBy)
    if (search) params.set("search", search)
    if (paymentFilter !== "all") params.set("paymentStatus", paymentFilter)
    if (fulfillmentFilter !== "all") params.set("fulfillmentStatus", fulfillmentFilter)
    return params.toString()
  }, [page, sortBy, search, paymentFilter, fulfillmentFilter])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders?${queryString}`, { cache: "no-store" })
      const payload = (await response.json()) as OrdersApiResponse

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to fetch orders")
      }

      setOrders(payload.data || [])
      setTotal(payload.meta?.total || 0)
      setTotalPages(payload.meta?.totalPages || 1)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch orders"
      setError(message)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [queryString])

  useEffect(() => {
    if (!selectedOrderId) {
      setOrderDetail(null)
      return
    }

    const fetchDetail = async () => {
      setDetailLoading(true)
      try {
        const response = await fetch(`/api/orders/${selectedOrderId}`, { cache: "no-store" })
        const payload = (await response.json()) as OrderDetailApiResponse

        if (!response.ok || !payload.success) {
          throw new Error(payload.error || "Failed to fetch order details")
        }

        setOrderDetail(payload.data)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch order details"
        toast.error(message)
        setSelectedOrderId(null)
      } finally {
        setDetailLoading(false)
      }
    }

    fetchDetail()
  }, [selectedOrderId])

  const getAllowedTransitions = (status: FulfillmentStatus) => FULFILLMENT_TRANSITIONS[status] || []

  const requestFulfillmentChange = (order: OrderSummary, next: FulfillmentStatus) => {
    if (next === order.fulfillmentStatus) return
    setPendingUpdate({ id: order.id, current: order.fulfillmentStatus, next })
  }

  const requestOrderDelete = (orderId: string) => {
    setDeleteOrderId(orderId)
  }

  const applyOrderDelete = async () => {
    if (!deleteOrderId) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/orders/${deleteOrderId}`, {
        method: "DELETE",
      })
      const payload = (await response.json()) as { success: boolean; error?: string }

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to delete order")
      }

      toast.success("Order deleted successfully")
      setOrders((prev) => prev.filter((order) => order.id !== deleteOrderId))
      setTotal((prev) => Math.max(0, prev - 1))
      if (selectedOrderId === deleteOrderId) {
        setSelectedOrderId(null)
      }
      setDeleteOrderId(null)
      fetchOrders()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete order")
    } finally {
      setDeleting(false)
    }
  }

  const applyFulfillmentChange = async () => {
    if (!pendingUpdate) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/orders/${pendingUpdate.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fulfillmentStatus: pendingUpdate.next }),
      })

      const payload = (await response.json()) as { success: boolean; error?: string }
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to update fulfillment status")
      }

      toast.success("Order status updated")
      setPendingUpdate(null)
      fetchOrders()

      if (selectedOrderId === pendingUpdate.id) {
        const detailResponse = await fetch(`/api/orders/${pendingUpdate.id}`, { cache: "no-store" })
        const detailPayload = (await detailResponse.json()) as OrderDetailApiResponse
        if (detailResponse.ok && detailPayload.success) {
          setOrderDetail(detailPayload.data)
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search by order ID, customer or email"
          className="xl:col-span-1"
          suppressHydrationWarning
        />

        <Select
          value={paymentFilter}
          onValueChange={(value) => {
            setPaymentFilter(value as PaymentStatus | "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={fulfillmentFilter}
          onValueChange={(value) => {
            setFulfillmentFilter(value as FulfillmentStatus | "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Fulfillment Status" />
          </SelectTrigger>
          <SelectContent>
            {FULFILLMENT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value) => {
            setSortBy(value as (typeof SORT_OPTIONS)[number]["value"])
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        {loading ? "Loading orders..." : `Showing ${orders.length} of ${total} orders`}
      </p>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden sm:table-cell">Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Fetching orders...
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-8 text-center text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                    No orders found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const allowedTransitions = getAllowedTransitions(order.fulfillmentStatus)

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{formatOrderId(order.id)}</TableCell>
                      <TableCell>{`${order.customer.firstName} ${order.customer.lastName}`}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {order.customer.email}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{order.itemsCount}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            order.paymentMethod === "cod"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : order.paymentMethod === "upi"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : order.paymentMethod === "card"
                              ? "border-purple-200 bg-purple-50 text-purple-700"
                              : "border-slate-200 bg-slate-100 text-slate-700"
                          }`}
                        >
                          {order.paymentMethod === "cod"
                            ? "COD"
                            : order.paymentMethod === "upi"
                            ? "UPI"
                            : order.paymentMethod === "card"
                            ? "Card"
                            : order.paymentMethod === "netbanking"
                            ? "Net Banking"
                            : order.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPaymentBadgeClass(order.paymentStatus)}>
                          {toTitleCase(order.paymentStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.fulfillmentStatus}
                          onValueChange={(value) => requestFulfillmentChange(order, value as FulfillmentStatus)}
                        >
                          <SelectTrigger className="h-8 min-w-34">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FULFILLMENT_STATUS_OPTIONS.map((option) => {
                              const isSelected = order.fulfillmentStatus === option.value
                              const isAllowed = isSelected || allowedTransitions.includes(option.value)

                              return (
                                <SelectItem
                                  key={`${order.id}-${option.value}`}
                                  value={option.value}
                                  disabled={!isAllowed}
                                >
                                  {option.label}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" className="inline-flex items-center gap-2" onClick={() => setSelectedOrderId(order.id)}>
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="inline-flex items-center gap-2 text-destructive"
                          onClick={() => requestOrderDelete(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((prev) => prev - 1)}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {orderDetail ? `Order ${formatOrderId(orderDetail.id)}` : "Order Details"}
            </DialogTitle>
            <DialogDescription>
              {orderDetail ? `Placed on ${formatDate(orderDetail.createdAt)}` : "Loading order details"}
            </DialogDescription>
          </DialogHeader>

          {detailLoading || !orderDetail ? (
            <div className="py-10 text-center text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching details...
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 text-sm font-semibold">Customer</h4>
                  <p className="font-medium">{orderDetail.customer.firstName} {orderDetail.customer.lastName}</p>
                  <p className="text-sm text-muted-foreground">{orderDetail.customer.email}</p>
                  <p className="text-sm text-muted-foreground">{orderDetail.customer.phone}</p>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 text-sm font-semibold">Shipping</h4>
                  <p className="text-sm">{orderDetail.customer.address}</p>
                  <p className="text-sm">{orderDetail.customer.city}, {orderDetail.customer.state}</p>
                  <p className="text-sm">PIN {orderDetail.customer.pincode}</p>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="mb-2 text-sm font-semibold">Items</h4>
                <div className="space-y-2">
                  {orderDetail.items.map((item) => (
                    <div key={`${item.productId}-${item.name}`} className="flex items-start justify-between gap-3 text-sm">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-muted-foreground">Qty {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-t pt-3 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(orderDetail.subtotal)}</span></div>
                  <div className="flex justify-between"><span>Discount</span><span>-{formatCurrency(orderDetail.discount)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{formatCurrency(orderDetail.shipping)}</span></div>
                  <div className="mt-2 flex justify-between font-semibold"><span>Total</span><span>{formatCurrency(orderDetail.total)}</span></div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 text-sm font-semibold">Payment Metadata</h4>
                  <p className="text-sm">Method: {orderDetail.paymentMethod}</p>
                  <p className="text-sm">Payment ID: {orderDetail.paymentId || "-"}</p>
                  <p className="text-sm">Gateway Order ID: {orderDetail.gatewayOrderId || "-"}</p>
                  <p className="text-sm">Status: {toTitleCase(orderDetail.paymentStatus)}</p>
                  {orderDetail.paymentError ? <p className="text-sm text-destructive">Error: {orderDetail.paymentError}</p> : null}
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 text-sm font-semibold">Timeline</h4>
                  <div className="space-y-1 text-sm">
                    <p>Created: {formatDate(orderDetail.createdAt)}</p>
                    <p>Updated: {formatDate(orderDetail.updatedAt)}</p>
                    <p>Paid At: {orderDetail.paidAt ? formatDate(orderDetail.paidAt) : "-"}</p>
                    <p>Failed At: {orderDetail.failedAt ? formatDate(orderDetail.failedAt) : "-"}</p>
                    <p>Fulfillment: {toTitleCase(orderDetail.fulfillmentStatus)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteOrderId} onOpenChange={(open) => !open && setDeleteOrderId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>Delete this order permanently?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOrderId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={applyOrderDelete} disabled={deleting}>
              {deleting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting
                </span>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingUpdate} onOpenChange={(open) => !open && setPendingUpdate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Status Update</DialogTitle>
            <DialogDescription>
              {pendingUpdate
                ? `Change fulfillment from '${pendingUpdate.current}' to '${pendingUpdate.next}'?`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingUpdate(null)} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={applyFulfillmentChange} disabled={updating}>
              {updating ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating
                </span>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
