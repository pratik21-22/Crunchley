"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { ProductCard, type ProductCardProps } from "@/components/product/product-card"
import {
  Search, SlidersHorizontal, ChevronDown, X,
  PackageOpen, Flame, Leaf, Truck, BadgeCheck, Heart,
} from "lucide-react"

// ── Skeleton ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-white overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-100" />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="h-3.5 bg-slate-100 rounded-full w-3/4" />
        <div className="h-3   bg-slate-100 rounded-full w-1/2" />
        <div className="h-3   bg-slate-100 rounded-full w-2/5 mt-1" />
        <div className="h-10  bg-slate-100 rounded-xl mt-2" />
      </div>
    </div>
  )
}

// ── Trust strip data ──────────────────────────────────────────────────────
const TRUST = [
  { icon: Flame,      label: "Roasted, Not Fried",       iconBg: "bg-orange-50",  iconColor: "text-orange-500"  },
  { icon: BadgeCheck, label: "Premium Quality",           iconBg: "bg-violet-50",  iconColor: "text-violet-500"  },
  { icon: Truck,      label: "Fast Pan-India Delivery",   iconBg: "bg-sky-50",     iconColor: "text-sky-500"     },
  { icon: Leaf,       label: "100% Made in India",        iconBg: "bg-emerald-50", iconColor: "text-emerald-500" },
]

// ── Constants ─────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Classic", "Spicy", "Cheese", "Herbal", "Sweet"]
const SORT_OPTIONS = [
  { label: "Featured",          value: "featured"   },
  { label: "Price: Low → High", value: "price_asc"  },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Name A → Z",       value: "name_asc"   },
]
const PAGE_SIZE = 8

interface ProductApiItem {
  _id?: string
  id?: string
  name: string
  slug?: string
  price: number
  originalPrice?: number
  image: string
  badge?: string | null
  category?: string
  description?: string
}

function normalizeProduct(item: ProductApiItem): ProductCardProps {
  return {
    id: item.id ?? item._id ?? item.slug ?? item.name,
    name: item.name,
    slug: item.slug,
    price: item.price,
    originalPrice: item.originalPrice,
    image: item.image,
    badge: item.badge,
    category: item.category,
    description: item.description,
  }
}

// ── Static fallback ───────────────────────────────────────────────────────
const FALLBACK: ProductCardProps[] = [
  { id:"1", name:"Classic Roasted Makhana", slug:"classic-makhana",   price:199, originalPrice:249, image:"/images/product-bowl.jpg",      badge:"Bestseller" },
  { id:"2", name:"Cheese Makhana",          slug:"cheese-makhana",    price:229, originalPrice:279, image:"/images/cheese-makhana.jpg",    badge:"Fan Fav"    },
  { id:"3", name:"Pudina Makhana",          slug:"pudina-makhana",    price:219, originalPrice:269, image:"/images/pudina-makhana.jpg",    badge:null         },
  { id:"4", name:"Peri Peri Makhana",       slug:"peri-peri-makhana", price:229, originalPrice:279, image:"/images/peri-peri-makhana.jpg", badge:"Hot Pick"   },
  { id:"5", name:"Tomato Makhana",          slug:"tomato-makhana",    price:199, originalPrice:249, image:"/images/tomato-makhana.jpg",    badge:"Classic"    },
  { id:"6", name:"Cream & Onion Makhana",   slug:"cream-onion",       price:229, originalPrice:269, image:"/images/cheese-makhana.jpg",    badge:null         },
  { id:"7", name:"Salt & Pepper Makhana",   slug:"salt-pepper",       price:199, originalPrice:239, image:"/images/pudina-makhana.jpg",    badge:"Minimal"    },
  { id:"8", name:"BBQ Makhana",             slug:"bbq-makhana",       price:239, originalPrice:289, image:"/images/peri-peri-makhana.jpg", badge:"Smoky"      },
]

export default function ShopPage() {
  const [products, setProducts] = useState<ProductCardProps[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState("")
  const [category, setCategory] = useState("All")
  const [sort, setSort]         = useState("featured")
  const [sortOpen, setSortOpen] = useState(false)
  const [page, setPage]         = useState(1)
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())
  const toolbarRef = useRef<HTMLDivElement>(null)

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-sort-dropdown]")) setSortOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Fetch from API with a 3-second timeout.
  // If MongoDB is unreachable the API hangs for ~30s; we abort early
  // and immediately render the static fallback products instead.
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const controller = new AbortController()
      const timeoutId  = setTimeout(() => controller.abort(), 3000)
      try {
        const res  = await fetch("/api/products", { signal: controller.signal })
        clearTimeout(timeoutId)
        const json = await res.json()
        const data = Array.isArray(json?.data)
          ? (json.data as ProductApiItem[]).map(normalizeProduct)
          : []
        setProducts(json?.success && data.length ? data : FALLBACK)
      } catch {
        clearTimeout(timeoutId)
        setProducts(FALLBACK)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const processed = useMemo(() => {
    let list = [...products]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q))
    }
    if (category !== "All") {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(category.toLowerCase()) ||
          p.category?.toLowerCase().includes(category.toLowerCase())
      )
    }
    if (sort === "price_asc")  list.sort((a, b) => a.price - b.price)
    if (sort === "price_desc") list.sort((a, b) => b.price - a.price)
    if (sort === "name_asc")   list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [products, search, category, sort])

  const totalPages = Math.ceil(processed.length / PAGE_SIZE)
  const paginated  = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort"

  const toggleWishlist = (id: string) =>
    setWishlist((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const clearFilters = () => { setSearch(""); setCategory("All"); setPage(1) }

  return (
    <div className="min-h-screen bg-[#FFFDF8] pt-16">

      {/* ── COMPACT PAGE HEADER ──────────────────────────────────────── */}
      <div className="bg-linear-to-b from-[#FFF8E7] to-[#FFFDF8] border-b border-amber-50 py-8 md:py-10">
        <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-amber-600 mb-1.5">Crunchley Store</p>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-[#1c1917]">
              Shop All Flavours
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-1 max-w-xs">
              Roasted, not fried — guilt-free snacking for every craving.
            </p>
          </div>
          {!loading && (
            <p className="text-sm text-slate-400 font-medium self-end pb-0.5">
              <span className="font-bold text-[#1c1917]">{processed.length}</span> products
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">

        {/* ── STICKY TOOLBAR ───────────────────────────────────────────── */}
        <div
          ref={toolbarRef}
          className="sticky top-16 z-40 bg-[#FFFDF8]/95 backdrop-blur-md pt-4 pb-3 border-b border-amber-50 mb-6 -mx-5 md:-mx-8 lg:-mx-12 px-5 md:px-8 lg:px-12"
        >
          {/* Row 1: Search + Sort */}
          <div className="flex gap-3 items-center mb-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search flavours…"
                className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all shadow-sm hover:border-slate-300"
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); setPage(1) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative" data-sort-dropdown>
              <button
                onClick={() => setSortOpen((o) => !o)}
                className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 flex items-center gap-2 hover:border-amber-300 hover:text-[#D4900A] transition-all shadow-sm whitespace-nowrap min-w-37 justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                  {sortLabel}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-50 overflow-hidden py-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setSortOpen(false); setPage(1) }}
                      className={`w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-amber-50 ${
                        sort === opt.value ? "text-[#D4900A] font-bold bg-amber-50/70" : "text-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Category pills */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1) }}
                className={`h-8 px-3.5 rounded-full text-[12px] font-semibold transition-all duration-150 border ${
                  category === cat
                    ? "bg-[#1c1917] text-white border-[#1c1917] shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-amber-300 hover:text-[#D4900A] hover:bg-amber-50/40"
                }`}
              >
                {cat}
              </button>
            ))}
            {(search || category !== "All") && (
              <button
                onClick={clearFilters}
                className="h-8 px-3.5 rounded-full text-[12px] font-semibold border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition-all flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ── SKELETON ─────────────────────────────────────────────────── */}
        {loading && (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-12">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── EMPTY STATE ──────────────────────────────────────────────── */}
        {!loading && processed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
              <PackageOpen className="h-8 w-8 text-amber-400" />
            </div>
            <div>
              <p className="font-black text-[#1c1917] text-lg">No products found</p>
              <p className="text-slate-400 text-sm mt-1">Try a different search or category</p>
            </div>
            <button
              onClick={clearFilters}
              className="mt-1 h-10 px-6 rounded-full bg-[#1c1917] text-white text-[14px] font-semibold hover:bg-[#F5A623] hover:text-[#2c1c02] transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* ── PRODUCT GRID ─────────────────────────────────────────────── */}
        {!loading && paginated.length > 0 && (
          <>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-2">
              {paginated.map((product) => (
                <div key={product.id} className="relative group/card">
                  {/* Wishlist button — overlaid */}
                  <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(product.id) }}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        wishlist.has(product.id)
                          ? "text-red-500 fill-red-500"
                          : "text-slate-400"
                      }`}
                    />
                  </button>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* ── PAGINATION ───────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="mt-10 mb-4 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                  disabled={page === 1}
                  className="h-10 px-5 rounded-full border border-slate-200 text-[13px] font-semibold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-300 hover:text-[#D4900A] transition-all"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => { setPage(pg); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                    className={`w-10 h-10 rounded-full text-[13px] font-bold transition-all ${
                      pg === page
                        ? "bg-[#1c1917] text-white shadow-sm"
                        : "border border-slate-200 text-slate-600 hover:border-amber-300 hover:text-[#D4900A]"
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                  disabled={page === totalPages}
                  className="h-10 px-5 rounded-full border border-slate-200 text-[13px] font-semibold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-300 hover:text-[#D4900A] transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* ── TRUST STRIP ──────────────────────────────────────────────── */}
        {!loading && (
          <div className="mt-10 mb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {TRUST.map(({ icon: Icon, label, iconBg, iconColor }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl bg-white border border-slate-100 px-4 py-3.5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} strokeWidth={2} />
                </div>
                <span className="text-[13px] font-semibold text-[#1c1917] leading-tight">{label}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
