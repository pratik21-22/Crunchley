"use client"

import Image from "next/image"
import Link from "next/link"
import { useCartStore } from "@/store/cart"
import { ShoppingBag, Star } from "lucide-react"
import { trackEvent } from "@/lib/analytics"

export interface ProductCardProps {
  id: string;
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
  const routeParam = product.slug
  const productHref = routeParam ? `/products/${encodeURIComponent(routeParam)}` : "/products"
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      slug: product.slug,
    })

    trackEvent("add_to_cart", {
      item_id: product.id,
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
    <Link href={productHref} className="block group">
      <div className="flex flex-col justify-between bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 h-full">

        {/* Fixed Image Container */}
        <div className="relative w-full h-[160px] sm:h-[180px] bg-[#FAF8F3] overflow-hidden flex items-center justify-center">
          {/* Discount badge */}
          {discount && (
            <div className="absolute top-3 left-3 z-10 bg-[#FFC107] text-[#2c1c02] text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
              {discount}% OFF
            </div>
          )}
          <Image
            src={product.image}
            alt={product.name}
            width={200}
            height={180}
            className="object-contain h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col flex-1 p-4">
          <h3 className="font-bold text-[#1c1917] text-[15px] leading-snug mb-1 min-h-[48px] flex items-start">
            {product.name}
          </h3>

          {/* Rating row */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs text-slate-400 font-medium">(4.9)</span>
          </div>

          {/* Price row */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-black text-[#1c1917]">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-slate-400 line-through font-medium">₹{product.originalPrice}</span>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleAddToCart}
            className="w-full h-11 rounded-xl bg-[#1c1917] text-white font-bold text-[14px] shadow-sm hover:bg-[#F5A623] hover:text-[#2c1c02] active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2 mt-auto"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Cart
          </button>
        </div>

      </div>
    </Link>
  )
}
