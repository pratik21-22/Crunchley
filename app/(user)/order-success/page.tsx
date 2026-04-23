import Link from "next/link"
import { CheckCircle2, PackageCheck, Receipt, Truck, Phone, MapPin, DollarSign } from "lucide-react"
import connectToDatabase from "@/lib/db"
import { getCurrentSession } from "@/lib/auth"
import Order from "@/lib/models/order"
import { normalizeGuestEmail, normalizeGuestPhone, verifyOrderAccessToken } from "@/lib/order-access"
import { OrderSuccessAnalytics } from "@/components/common/order-success-analytics"

type SearchParams = {
  orderId?: string
  guestToken?: string
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { orderId, guestToken } = await searchParams
  const session = await getCurrentSession()

  let order:
    | {
        id: string
        total: number
        status: string
        paymentStatus: string
        paymentMethod: string
        paymentId?: string
        createdAt: Date
        itemsCount: number
      }
    | null = null

  if (orderId) {
    try {
      await connectToDatabase()
      const found = await Order.findById(orderId).lean()
      if (found) {
        const isOwner = session ? found.userId === session.userId : false
        const isAdmin = session?.role === "admin"

        let isGuestAuthorized = false
        if (!session && guestToken) {
          const payload = await verifyOrderAccessToken(guestToken)
          isGuestAuthorized =
            Boolean(payload) &&
            payload?.orderId === String(found._id) &&
            payload?.email === normalizeGuestEmail(found.customer.email) &&
            payload?.phone === normalizeGuestPhone(found.customer.phone)
        }

        if (!isOwner && !isAdmin && !isGuestAuthorized) {
          order = null
        } else {
        order = {
          id: String(found._id),
          total: found.total,
          status: found.status,
          paymentStatus: found.paymentStatus,
          paymentMethod: found.paymentMethod,
          paymentId: found.paymentId,
          createdAt: found.createdAt,
          itemsCount: found.items.length,
        }
        }
      }
    } catch {
      // Keep page resilient even if DB read fails.
      order = null
    }
  }

  return (
    <main className="min-h-screen bg-[#FFFDF8] pt-20 pb-10">
      {order && (
        <OrderSuccessAnalytics
          orderId={order.id}
          total={order.total}
          itemsCount={order.itemsCount}
          paymentMethod={order.paymentMethod}
          paymentStatus={order.paymentStatus}
        />
      )}
      <div className="container mx-auto max-w-3xl px-5 md:px-8">
        <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] md:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>

          <p className="text-center text-xs font-bold uppercase tracking-widest text-emerald-600">
            {order?.paymentStatus === "paid" ? "Payment Successful" : "Order Placed"}
          </p>
          <h1 className="mt-2 text-center text-3xl font-black tracking-tight text-[#1c1917] md:text-4xl">
            Order Confirmed 🎉
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">
            {order?.paymentMethod === "cod"
              ? "✅ Your Pay on Delivery order is confirmed! Our delivery partner will contact you with shipping updates. Keep cash / UPI ready upon delivery."
              : order?.paymentStatus === "paid"
              ? "🎉 Payment received and order confirmed. We've started processing your order."
              : "Thank you for shopping with Crunchley. We have started processing your order and will notify you once it ships."}
          </p>

          {!session && (
            <div className="mx-auto mt-4 max-w-xl rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-800">
              To track your order anytime, please Register or Sign In using your email/mobile.
            </div>
          )}

          <div className="mt-8 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Order ID</p>
              <p className="mt-1 break-all text-sm font-bold text-[#1c1917]">{order?.id ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Items</p>
              <p className="mt-1 text-sm font-bold text-[#1c1917]">{order?.itemsCount ?? "-"}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total</p>
              <p className="mt-1 text-sm font-bold text-[#1c1917]">{order ? `₹${order.total.toFixed(2)}` : "-"}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-[#1c1917]">Fast delivery</p>
              <p className="mt-1 text-xs">Pan-India shipping with dispatch updates.</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-[#1c1917]">Trusted checkout</p>
              <p className="mt-1 text-xs">Payments handled securely through Razorpay.</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-[#1c1917]">Support ready</p>
              <p className="mt-1 text-xs">Need help? Contact the team from the footer.</p>
            </div>
          </div>

          {order?.paymentId && (
            <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              Payment ID: {order.paymentId}
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
              <p className="text-xs text-slate-400">Payment Method</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <DollarSign className="h-4 w-4" />
                {order?.paymentMethod ? (
                  order.paymentMethod === "cod"
                    ? "Pay on Delivery"
                    : order.paymentMethod === "upi"
                    ? "UPI"
                    : order.paymentMethod === "card"
                    ? "Card"
                    : order.paymentMethod === "netbanking"
                    ? "Net Banking"
                    : order.paymentMethod
                ) : "N/A"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
              <p className="text-xs text-slate-400">Payment Status</p>
              <p
                className={`mt-1 flex items-center gap-2 text-sm font-semibold ${
                  order?.paymentStatus === "paid"
                    ? "text-emerald-700"
                    : order?.paymentStatus === "failed"
                    ? "text-red-700"
                    : order?.paymentMethod === "cod"
                    ? "text-amber-700"
                    : "text-slate-700"
                }`}
              >
                <PackageCheck className="h-4 w-4" />
                {order?.paymentStatus === "pending" && order?.paymentMethod === "cod"
                  ? "Pending (Pay on Delivery)"
                  : order?.paymentStatus
                  ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)
                  : "Placed"}
              </p>
            </div>
          </div>

          {order?.paymentMethod === "cod" && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <p className="mb-4 flex items-center gap-2 font-semibold text-emerald-800">
                <Truck className="h-5 w-5" />
                Cash on Delivery Instructions
              </p>
              <div className="space-y-3 text-sm text-emerald-700">
                <div className="flex gap-3">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200 font-semibold text-emerald-800">1</span>
                  <span><span className="font-semibold">Keep cash ready.</span> Have ₹{order?.total.toFixed(2)} when our delivery partner arrives</span>
                </div>
                <div className="flex gap-3">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200 font-semibold text-emerald-800">2</span>
                  <span><span className="font-semibold">Wait for contact.</span> Our team will call you with delivery time and date</span>
                </div>
                <div className="flex gap-3">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200 font-semibold text-emerald-800">3</span>
                  <span><span className="font-semibold">Inspect & verify.</span> Check the order before making payment</span>
                </div>
                <div className="flex gap-3">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200 font-semibold text-emerald-800">4</span>
                  <span><span className="font-semibold">Secure receipt.</span> Ask for receipt and keep it for your records</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-[#1c1917] text-sm font-bold text-white transition-all hover:bg-[#F5A623] hover:text-[#2c1c02]"
            >
              Continue Shopping
            </Link>
            {session ? (
              <Link
                href="/"
                className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:text-[#D4900A]"
              >
                Go to Home
              </Link>
            ) : (
              <div className="flex flex-1 gap-3">
                <Link
                  href="/signup"
                  className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:text-[#D4900A]"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:text-[#D4900A]"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
