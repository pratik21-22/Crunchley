"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useRef } from "react"
import { ChevronDown } from "lucide-react"

const allFlavours = [
  // ── First 4 (always visible) ──
  {
    title: "Cheese",
    subtitle: "Rich & Creamy",
    url: "/products",
    image: "/images/cheese-makhana.jpg",
    tag: "🧀 Fan Fav",
  },
  {
    title: "Pudina",
    subtitle: "Fresh & Minty",
    url: "/products",
    image: "/images/pudina-makhana.jpg",
    tag: "🌿 Refreshing",
  },
  {
    title: "Peri Peri",
    subtitle: "Bold & Spicy",
    url: "/products",
    image: "/images/peri-peri-makhana.jpg",
    tag: "🌶️ Hot Pick",
  },
  {
    title: "Tomato",
    subtitle: "Tangy & Zesty",
    url: "/products",
    image: "/images/tomato-makhana.jpg",
    tag: "🍅 Classic",
  },
  // ── Extra flavours (revealed on expand) ──
  {
    title: "Cream & Onion",
    subtitle: "Smooth & Savoury",
    url: "/products",
    image: "/images/cheese-makhana.jpg",   // reuse until real images added
    tag: "🧅 Crowd Pleaser",
  },
  {
    title: "Tangy Masala",
    subtitle: "Spiced & Zingy",
    url: "/products",
    image: "/images/peri-peri-makhana.jpg",
    tag: "🌟 Bestseller",
  },
  {
    title: "Salt & Pepper",
    subtitle: "Simple & Classic",
    url: "/products",
    image: "/images/pudina-makhana.jpg",
    tag: "🧂 Minimal",
  },
  {
    title: "Himalayan Pink Salt",
    subtitle: "Pure & Clean",
    url: "/products",
    image: "/images/tomato-makhana.jpg",
    tag: "🏔️ Premium",
  },
  {
    title: "BBQ",
    subtitle: "Smoky & Bold",
    url: "/products",
    image: "/images/peri-peri-makhana.jpg",
    tag: "🔥 Smoky",
  },
]

const INITIAL_COUNT = 4

function FlavourCard({ flavour }: { flavour: (typeof allFlavours)[number] }) {
  return (
    <Link
      href={flavour.url}
      className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 block"
    >
      <Image
        src={flavour.image}
        alt={flavour.title}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {/* Dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

      {/* Top tag */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-bold text-slate-800 shadow-sm">
        {flavour.tag}
      </div>

      {/* Bottom text */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <h3 className="text-[18px] font-black text-white tracking-tight leading-none mb-0.5">
          {flavour.title}
        </h3>
        <p className="text-[13px] text-white/70 font-medium mb-3">{flavour.subtitle}</p>
        <div className="flex items-center gap-1.5 text-[13px] font-bold text-white/90 group-hover:gap-3 transition-all duration-300">
          Shop Now <span className="text-base leading-none">→</span>
        </div>
      </div>
    </Link>
  )
}

export function ShopByFlavour() {
  const [expanded, setExpanded] = useState(false)
  const extraRef = useRef<HTMLDivElement>(null)

  const visibleFlavours = allFlavours.slice(0, INITIAL_COUNT)
  const extraFlavours   = allFlavours.slice(INITIAL_COUNT)

  const handleToggle = () => {
    if (expanded) {
      // Collapse: scroll back to section top first for smooth UX
      document.getElementById("flavours")?.scrollIntoView({ behavior: "smooth", block: "start" })
      setTimeout(() => setExpanded(false), 200)
    } else {
      setExpanded(true)
    }
  }

  return (
    <section id="flavours" className="bg-[#FFFDF8] py-16 md:py-24 border-t border-amber-50">
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">

        {/* ── Header ── */}
        <div className="mb-10 text-center">
          <p className="text-xs font-bold tracking-widest uppercase text-amber-600 mb-3">
            All Flavours
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[#1c1917] mb-3">
            Shop by Flavour
          </h2>
          <p className="text-slate-500 text-base max-w-md mx-auto">
            Handcrafted bold, fresh flavours for every mood and craving.
          </p>
        </div>

        {/* ── Initial 4 cards ── */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {visibleFlavours.map((flavour) => (
            <FlavourCard key={flavour.title} flavour={flavour} />
          ))}
        </div>

        {/* ── Expandable extra cards ── */}
        <div
          ref={extraRef}
          style={{
            maxHeight: expanded ? `${extraRef.current?.scrollHeight ?? 2000}px` : "0px",
            opacity: expanded ? 1 : 0,
          }}
          className="overflow-hidden transition-all duration-700 ease-in-out"
        >
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 mt-4">
            {extraFlavours.map((flavour) => (
              <FlavourCard key={flavour.title} flavour={flavour} />
            ))}
          </div>
        </div>

        {/* ── Toggle Button ── */}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            suppressHydrationWarning
            onClick={handleToggle}
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full border-2 border-[#D4900A]/30 text-[#D4900A] font-bold text-[15px] bg-white hover:bg-[#D4900A] hover:text-white hover:border-[#D4900A] hover:shadow-[0_8px_30px_rgba(212,144,10,0.25)] active:scale-[0.97] transition-all duration-250"
          >
            {expanded ? "Show Less" : "View All Flavours"}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                expanded ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </div>

      </div>
    </section>
  )
}
