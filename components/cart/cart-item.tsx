"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"

interface CartItemProps {
  item: {
    id: string | number
    name: string
    slug?: string
    flavor?: string
    price: number
    originalPrice?: number
    quantity: number
    image: string
  }
  onIncreaseQuantity: (id: string | number) => void
  onDecreaseQuantity: (id: string | number) => void
  onRemove: (id: string | number) => void
}

export function CartItem({ item, onIncreaseQuantity, onDecreaseQuantity, onRemove }: CartItemProps) {
  const hasDiscount = item.originalPrice && item.originalPrice > item.price
  const savings     = hasDiscount ? (item.originalPrice! - item.price) * item.quantity : 0

  return (
    <div className="flex gap-4 py-5">

      {/* Image */}
      <Link href={item.slug ? `/products/${item.slug}` : "#"} className="shrink-0">
        <div className="relative h-21 w-21 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-[#FAF8F3] border border-slate-100">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {item.flavor && (
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mb-0.5">{item.flavor}</p>
            )}
            <Link href={item.slug ? `/products/${item.slug}` : "#"}>
              <h3 className="font-bold text-[#1c1917] text-[15px] leading-snug hover:text-[#D4900A] transition-colors truncate">
                {item.name}
              </h3>
            </Link>
            {savings > 0 && (
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">You save ₹{savings}</p>
            )}
          </div>

          {/* Remove — desktop */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label="Remove item"
            className="hidden sm:flex w-8 h-8 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 items-center justify-center transition-all shrink-0 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Qty + Price row */}
        <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">

          {/* Qty selector */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => onDecreaseQuantity(item.id)}
              disabled={item.quantity <= 1}
              className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-9 text-center text-[14px] font-bold text-[#1c1917]">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onIncreaseQuantity(item.id)}
              className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-black text-[#1c1917]">₹{(item.price * item.quantity).toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-[13px] text-slate-400 line-through">₹{(item.originalPrice! * item.quantity).toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* Remove — mobile */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="sm:hidden mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 hover:text-red-500 transition-colors w-fit"
        >
          <Trash2 className="h-3.5 w-3.5" /> Remove
        </button>
      </div>

    </div>
  )
}
