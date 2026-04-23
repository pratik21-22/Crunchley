import Link from "next/link"
import { redirect } from "next/navigation"
import { PackageCheck } from "lucide-react"
import connectToDatabase from "@/lib/db"
import { getCurrentSession } from "@/lib/auth"
import Order from "@/lib/models/order"

export default async function MyOrdersPage() {
  const session = await getCurrentSession()

  if (!session) {
    redirect("/login")
  }

  await connectToDatabase()

  const orders = await Order.find({ userId: session.userId }).sort({ createdAt: -1 }).lean()

  return (
    <main className="min-h-screen bg-[#FFFDF8] pt-20 pb-10">
      <div className="container mx-auto max-w-5xl px-5 md:px-8">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">My Account</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1c1917] md:text-4xl">My Orders</h1>
          <p className="mt-2 text-slate-500">Track your Crunchley orders and payment status.</p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
              <PackageCheck className="h-7 w-7 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-[#1c1917]">No orders yet</h2>
            <p className="mt-2 text-slate-500">Once you place an order, it will appear here.</p>
            <Link
              href="/products"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#1c1917] px-6 text-sm font-bold text-white transition-all hover:bg-[#F5A623] hover:text-[#2c1c02]"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={String(order._id)}
                href={`/order-success?orderId=${encodeURIComponent(String(order._id))}`}
                className="block rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_6px_24px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Order ID</p>
                    <p className="mt-1 text-sm font-bold text-[#1c1917] break-all">{String(order._id)}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Payment: {order.paymentMethod || "N/A"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Amount</p>
                    <p className="mt-1 text-lg font-black text-[#1c1917]">₹{order.total.toFixed(2)}</p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        order.status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
