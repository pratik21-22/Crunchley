import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Flame, Leaf, Star, ShieldCheck, Zap } from "lucide-react"

export function HeroSection({ tagline }: { tagline?: string }) {
  const heroTagline = tagline || "Roasted, not fried. Guilt-free snacking made irresistibly delicious."

  return (
    <section id="home" className="relative w-full min-h-[92svh] sm:min-h-svh flex items-center overflow-hidden bg-linear-to-br from-[#FFFDF8] via-[#FAF3E3] to-[#F2E5CC] pt-[5.5rem] pb-6 sm:pt-16 sm:pb-10 md:pb-16">

      {/* Ambient light blobs */}
      <div className="absolute top-0 right-0 w-175 h-175 bg-white/50 blur-[140px] pointer-events-none rounded-full translate-x-1/3 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-[#FFC107]/8 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-1/4 w-75 h-75 bg-[#F5A623]/6 blur-[80px] pointer-events-none rounded-full" />

      <div className="container relative z-10 mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-6 items-center">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col space-y-3.5 sm:space-y-6 max-w-lg lg:max-w-xl animate-in fade-in slide-in-from-bottom-6 duration-700">

            {/* Eyebrow tag */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 self-start rounded-full bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200/80 px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-sm shadow-[0_4px_16px_rgba(245,166,35,0.12)]">
              <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500 fill-amber-400 animate-pulse" />
              <span className="relative top-px inline-flex items-center text-[11px] sm:text-xs leading-[1.3] sm:leading-[1.35] font-bold text-amber-700 tracking-[0.12em] sm:tracking-widest uppercase">🇮🇳 India's #1 Guilt-Free Snack</span>
            </div>

            {/* Headline */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-[2.2rem] sm:text-5xl md:text-6xl lg:text-[3.75rem] xl:text-[4.5rem] font-black tracking-tight text-[#1c1917] leading-[1.06] sm:leading-[1.12]">
                <span className="block mb-0.5 sm:mb-1.5">Crunchley –</span>
                <span className="block mb-0.5 sm:mb-1.5 text-[#F5A623]">Crunch</span>
                <span className="block">That Feels Healthy</span>
              </h1>

              <div className="pt-0.5 sm:pt-2">
                <p className="text-[15px] md:text-lg text-slate-600 leading-relaxed max-w-sm font-medium">
                  {heroTagline}
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3.5 pt-1.5 sm:pt-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2.5 font-bold h-[46px] sm:h-14 px-6.5 sm:px-9 rounded-full bg-linear-to-b from-[#FFD000] to-[#F5A623] text-[#2c1c02] shadow-[0_10px_36px_rgba(245,166,35,0.4)] hover:shadow-[0_16px_48px_rgba(245,166,35,0.55)] hover:-translate-y-1.5 active:scale-[0.95] transition-all duration-300 text-[15px] sm:text-[16px] group overflow-hidden relative"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  Shop Now
                  <ArrowRight className="h-5 w-5 stroke-[2.5] group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 font-semibold h-[46px] sm:h-14 px-6.5 sm:px-9 rounded-full border-2 border-[#E8D4A0] bg-white/80 backdrop-blur-xl text-slate-800 hover:bg-white hover:border-[#F5A623]/60 hover:shadow-[0_8px_24px_rgba(245,166,35,0.2)] hover:-translate-y-1.5 transition-all duration-300 text-[15px] sm:text-[16px]"
              >
                Explore Flavours
              </Link>
            </div>

            {/* Social Proof Row */}
            <div className="pt-3 sm:pt-6 flex flex-wrap items-start sm:items-center gap-x-4 sm:gap-x-6 gap-y-2.5 sm:gap-y-4">

              {/* Avatars + stars */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-sm">
                    <Image src="/images/pudina-makhana.jpg" width={36} height={36} alt="customer" className="object-cover w-full h-full scale-150" />
                  </div>
                  <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-sm">
                    <Image src="/images/cheese-makhana.jpg" width={36} height={36} alt="customer" className="object-cover w-full h-full scale-150" />
                  </div>
                  <div className="w-9 h-9 rounded-full border-2 border-white bg-[#FFC107] flex items-center justify-center text-[10px] font-extrabold text-amber-900 shadow-sm">
                    +1k
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 text-[#F5A623] fill-[#F5A623]" />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1">4.9</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">1,000+ Happy Customers</span>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-10 w-px bg-linear-to-b from-slate-200 via-slate-200 to-transparent" />

              {/* India badge */}
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 border border-emerald-200/60 shadow-[0_4px_16px_rgba(16,185,129,0.1)]">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                <span className="text-[12px] sm:text-[13px] font-bold text-slate-700">100% Made in India</span>
              </div>

            </div>
          </div>

          {/* ── RIGHT COLUMN: Product Image ── */}
          <div className="relative w-full h-95 sm:h-115 md:h-130 lg:h-145 flex items-center justify-center animate-in fade-in zoom-in-95 duration-1000 delay-200 mt-8 lg:mt-0">

            {/* Multi-layered depth shadows */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Outer glow */}
              <div className="absolute w-[85%] h-[85%] rounded-full bg-[#F5A623]/20 blur-[100px] opacity-60" />
              {/* Mid glow */}
              <div className="absolute w-[70%] h-[70%] rounded-full bg-[#FFD000]/12 blur-[80px] opacity-70" />
              {/* Inner glow */}
              <div className="absolute w-[55%] h-[55%] rounded-full bg-[#F5A623]/8 blur-[60px]" />
            </div>

            {/* Radial-masked image with enhanced shadow */}
            <div className="relative w-[120%] sm:w-[110%] lg:w-[115%] h-full flex items-center justify-center mask-[radial-gradient(ellipse_60%_60%_at_center,black_40%,transparent_72%)] drop-shadow-[0_20px_50px_rgba(245,166,35,0.25)]">
              <Image
                src="/images/hero-makhana.png"
                alt="Crunchley Roasted Makhana Bowl"
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-contain z-10 hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>

            {/* Floating badge – top left */}
            <div className="absolute top-[8%] left-0 lg:left-6 z-20 flex items-center gap-2.5 rounded-full bg-white/95 backdrop-blur-xl px-5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-white/80 hover:scale-110 hover:shadow-[0_16px_48px_rgba(0,0,0,0.16)] transition-all duration-300 cursor-default group">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-50 to-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Leaf className="h-5 w-5 text-emerald-600" strokeWidth={2.5} />
              </div>
              <span className="text-[13px] font-bold text-[#1c1917]">100% Natural</span>
            </div>

            {/* Floating badge – bottom right */}
            <div className="absolute bottom-[8%] right-0 lg:right-6 z-20 flex items-center gap-2.5 rounded-full bg-white/95 backdrop-blur-xl px-5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-white/80 hover:scale-110 hover:shadow-[0_16px_48px_rgba(0,0,0,0.16)] transition-all duration-300 cursor-default group">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-amber-50 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Flame className="h-5 w-5 text-amber-500" strokeWidth={2.5} />
              </div>
              <span className="text-[13px] font-bold text-[#1c1917]">Roasted Not Fried</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
