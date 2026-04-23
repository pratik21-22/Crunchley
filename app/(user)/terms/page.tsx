import Link from "next/link"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF8] pt-20 pb-10">
      <div className="container mx-auto max-w-4xl px-5 md:px-8">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] md:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Terms</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1c1917] md:text-4xl">Terms of service</h1>
          <div className="mt-8 space-y-4 text-sm leading-6 text-slate-600">
            <p>By placing an order, you agree to provide accurate shipping and contact information.</p>
            <p>Payments are processed securely through supported payment providers and order confirmation is subject to successful verification.</p>
            <p>Product availability, pricing, and promotions may change without prior notice, but confirmed orders will be honored as placed.</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1c1917] px-6 text-sm font-bold text-white transition-all hover:bg-[#F5A623] hover:text-[#2c1c02]">
              Continue Shopping
            </Link>
            <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:text-[#D4900A]">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}