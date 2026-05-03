"use client"

import { useState } from "react"
import Image from "next/image"
import { useCartStore } from "@/store/cart"
import { ShoppingBag, Star } from "lucide-react"
import { trackEvent } from "@/lib/analytics"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export interface ProductCardProps {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  image: string;
  badge?: string | null;
  category?: string;
  description?: string;
}

export function ProductCard({ product }: { product: ProductCardProps }) {
  if (!product.slug) {
    console.error("Missing slug:", product)
  }

  const [previewOpen, setPreviewOpen] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    const productId = product._id || product.id
    addItem({
      id: productId,
      productId,
      _id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      slug: product.slug,
    })

    trackEvent("add_to_cart", {
      item_id: productId,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      currency: "INR",
    })
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  return (
    <>
      <div className="group flex flex-col h-full bg-white rounded-2xl border border-slate-200/50 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-400 ease-out">

        {/* Fixed Image Container - Full Bleed */}
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="relative w-full h-[200px] sm:h-[240px] bg-gradient-to-br from-[#FAF8F3] to-[#F5F3ED] overflow-hidden flex items-center justify-center border-b border-slate-100/50 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2"
          aria-label={`Preview ${product.name}`}
        >
          {/* Discount badge */}
          {discount && (
            <div className="absolute top-4 left-4 z-10 bg-[#FFC107] text-[#2c1c02] text-[12px] font-black px-3 py-1.5 rounded-full shadow-[0_4px_12px_rgba(255,193,7,0.3)] backdrop-blur-sm">
              {discount}% OFF
            </div>
          )}
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-active:scale-105"
            priority={false}
          />
        </button>

        {/* Product Info */}
        <div className="flex flex-col flex-1 p-5 sm:p-6 gap-3">
          <h3 className="font-bold text-[#1c1917] text-base sm:text-[17px] leading-tight min-h-[48px] flex items-start tracking-tight">
            {product.name}
          </h3>

          {/* Rating row */}
          <div className="flex items-center gap-2.5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs text-slate-500 font-semibold">(4.9)</span>
          </div>

          {/* Price row */}
          <div className="flex items-center gap-2.5 pt-1 flex-wrap">
            <span className="text-xl sm:text-2xl font-black text-[#1c1917] tracking-tight">₹{product.price}</span>
            {product.originalPrice && (
              <>
                <span className="text-sm text-slate-400 line-through font-semibold">₹{product.originalPrice}</span>
                <span className="text-xs font-bold text-[#2c1c02] bg-[#FFC107] px-2.5 py-1 rounded-full">
                  Save ₹{product.originalPrice - product.price}
                </span>
              </>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleAddToCart}
            className="w-full h-12 sm:h-13 mt-auto rounded-xl bg-[#1c1917] hover:bg-[#2c2420] text-white font-bold text-[15px] shadow-[0_4px_12px_rgba(28,25,23,0.15)] hover:shadow-[0_8px_20px_rgba(28,25,23,0.25)] active:scale-[0.98] transition-all duration-300 ease-out flex items-center justify-center gap-2.5 flex-shrink-0"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Add to Cart</span>
          </button>
        </div>

      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent showCloseButton className="max-w-[min(92vw,900px)] border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{product.name} preview</DialogTitle>
          <DialogDescription className="sr-only">Large product image preview</DialogDescription>

          <div className="relative overflow-hidden rounded-3xl bg-[#FFFDF8] p-3 sm:p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/60">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FAF8F3] to-[#F5F3ED] aspect-square sm:aspect-[4/3]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 92vw, 900px"
                className="object-contain p-4 sm:p-6 animate-in zoom-in-95 duration-300"
                priority
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 px-1 sm:px-2 pb-1">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-600">Preview</p>
                <h3 className="text-lg sm:text-xl font-black text-[#1c1917] tracking-tight">{product.name}</h3>
              </div>
              <span className="text-sm font-semibold text-slate-500">₹{product.price}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
