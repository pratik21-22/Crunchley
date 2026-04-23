import Link from "next/link"
import { SearchX, ArrowRight } from "lucide-react"

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFDF8] px-5 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.06)] md:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <SearchX className="h-8 w-8 text-amber-600" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600">404</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1c1917]">Page not found</h1>
        <p className="mx-auto mt-3 max-w-lg text-slate-500">
          The page you requested does not exist or has moved. Explore Crunchley&apos;s products or return home.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1c1917] px-6 text-sm font-bold text-white transition-all hover:bg-[#F5A623] hover:text-[#2c1c02]"
          >
            Browse Products
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:text-[#D4900A]"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  )
}
