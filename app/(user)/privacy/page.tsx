import Link from "next/link"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF8] pt-20 pb-10">
      <div className="container mx-auto max-w-4xl px-5 md:px-8">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] md:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Privacy</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1c1917] md:text-4xl">Privacy policy</h1>
          <div className="mt-8 space-y-4 text-sm leading-6 text-slate-600">
            <p>We collect the information required to process orders, provide support, and improve the shopping experience.</p>
            <p>Your account and order details are used to fulfill purchases and communicate shipping or payment updates.</p>
            <p>We do not sell your personal information. Any third-party services are used only to operate the store and process payments securely.</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1c1917] px-6 text-sm font-bold text-white transition-all hover:bg-[#F5A623] hover:text-[#2c1c02]">
              Contact Support
            </Link>
            <Link href="/terms" className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:text-[#D4900A]">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}