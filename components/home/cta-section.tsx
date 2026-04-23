import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export function CtaSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-[#FFF8E7] via-[#FFF3CC] to-[#FFE8A3]">

      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#FFC107]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#F5A623]/15 rounded-full blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto px-5 md:px-8 text-center flex flex-col items-center">

        {/* Eye tag */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-amber-200/60 px-4 py-1.5 mb-6 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs font-bold text-amber-700 tracking-widest uppercase">Limited Stock Available</span>
        </div>

        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#1c1917] max-w-2xl leading-[1.1] mb-5">
          Upgrade Your Snacking <span className="text-[#D4900A]">Today</span>
        </h2>

        <p className="text-slate-600 text-base md:text-lg max-w-md mb-10 leading-relaxed">
          Join 1,000+ health-conscious snackers who've already made the switch.
        </p>

        <div className="flex justify-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2.5 font-bold h-14 px-10 rounded-full bg-[#1c1917] text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.30)] hover:-translate-y-1 active:scale-[0.97] transition-all duration-200 text-[16px]"
          >
            Shop All Flavours <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

      </div>
    </section>
  )
}
