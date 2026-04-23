import Link from "next/link"
import { AlertTriangle, RefreshCcw } from "lucide-react"

type SearchParams = {
  orderId?: string
  message?: string
}

export default async function OrderFailedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { orderId, message } = await searchParams

  return (
    <main className="min-h-screen bg-[#FFFDF8] pt-20 pb-10">
      <div className="container mx-auto max-w-2xl px-5 md:px-8">
        <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.06)] md:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-9 w-9 text-red-600" />
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-red-600">Order Failed</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1c1917] md:text-4xl">
            We couldn't place your order
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-slate-500">
            {message || "Something went wrong while placing your order. Please try again."}
          </p>

          {orderId && (
            <p className="mx-auto mt-3 max-w-lg text-xs font-semibold uppercase tracking-wide text-slate-400">
              Order ID: {orderId}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/checkout"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1c1917] px-6 text-sm font-bold text-white transition-all hover:bg-[#F5A623] hover:text-[#2c1c02]"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry Payment
            </Link>
            <Link
              href="/cart"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:text-[#D4900A]"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
