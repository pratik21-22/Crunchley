"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingBag, Truck, Tag } from "lucide-react"
import { CartItem } from "@/components/cart/cart-item"
import { useCartStore, type CartItem as CartItemType } from "@/store/cart"

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const cartStore = useCartStore()

  useEffect(() => { setMounted(true) }, [])

  const cartItems    = cartStore.items
  const increaseQty  = cartStore.increaseQuantity
  const decreaseQty  = cartStore.decreaseQuantity
  const removeItem   = cartStore.removeItem
  const clearCart    = cartStore.clearCart
  const itemCount    = cartStore.getCartCount()

  const subtotal  = cartItems.reduce((s: number, i: CartItemType) => s + (i.originalPrice || i.price) * i.quantity, 0)
  const discount  = cartItems.reduce((s: number, i: CartItemType) => s + ((i.originalPrice || i.price) - i.price) * i.quantity, 0)
  const shipping  = subtotal >= 499 || itemCount === 0 ? 0 : 49
  const total     = subtotal - discount + shipping

  if (!mounted) return <div className="min-h-screen bg-[#FFFDF8] pt-16" />

  return (
    <div className="min-h-screen bg-[#FFFDF8] pt-16">

      {/* ── Page header ── */}
      <div className="bg-linear-to-b from-[#FFF8E7] to-[#FFFDF8] border-b border-amber-50 py-7 md:py-9">
        <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-6xl">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-[#D4900A] transition-colors mb-4 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Continue Shopping
          </Link>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-[#1c1917]">
            Your Cart
            {itemCount > 0 && (
              <span className="ml-3 text-lg font-semibold text-slate-400">({itemCount} {itemCount === 1 ? "item" : "items"})</span>
            )}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-6xl py-8 md:py-12">

        {cartItems.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-3">

            {/* ── Cart items ── */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden">

                {/* Header row */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <p className="text-[13px] font-semibold text-slate-500">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
                  <button
                    onClick={clearCart}
                    className="text-[13px] font-semibold text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>

                {/* Items */}
                <div className="divide-y divide-slate-100 px-6">
                  {cartItems.map((item: CartItemType) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onIncreaseQuantity={increaseQty}
                      onDecreaseQuantity={decreaseQty}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </div>

              {/* Free shipping nudge */}
              {shipping > 0 && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                  <Truck className="h-4 w-4 text-amber-600 shrink-0" />
                  <p className="text-[13px] font-semibold text-amber-800">
                    Add ₹{(499 - (subtotal - discount)).toFixed(0)} more for <span className="text-emerald-600">FREE shipping!</span>
                  </p>
                </div>
              )}
              {shipping === 0 && itemCount > 0 && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                  <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <p className="text-[13px] font-semibold text-emerald-800">🎉 You've unlocked <span className="font-black">Free Shipping!</span></p>
                </div>
              )}
            </div>

            {/* ── Order summary ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl bg-white border border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden">

                <div className="px-6 py-5 border-b border-slate-100">
                  <h2 className="font-black text-[#1c1917] text-lg">Order Summary</h2>
                </div>

                <div className="px-6 py-5 flex flex-col gap-3">
                  <div className="flex justify-between text-[14px] text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[14px] text-emerald-600">
                      <span>Discount</span>
                      <span className="font-semibold">−₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[14px] text-slate-600">
                    <span>Shipping</span>
                    <span className={`font-semibold ${shipping === 0 ? "text-emerald-600" : ""}`}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-3 flex justify-between text-[16px]">
                    <span className="font-black text-[#1c1917]">Total</span>
                    <span className="font-black text-[#1c1917]">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <Link href="/checkout">
                    <button className="w-full h-13 rounded-xl bg-[#1c1917] text-white font-bold text-[15px] hover:bg-[#F5A623] hover:text-[#2c1c02] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(245,166,35,0.30)] flex items-center justify-center gap-2">
                      Proceed to Checkout →
                    </button>
                  </Link>

                  {/* Promo code */}
                  <div className="mt-4 flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Promo code"
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all"
                      />
                    </div>
                    <button className="h-10 px-4 rounded-xl bg-slate-100 text-slate-700 text-[13px] font-bold hover:bg-amber-50 hover:text-[#D4900A] transition-all">
                      Apply
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center mt-4">
                    🔒 Secure checkout. All transactions encrypted.
                  </p>
                </div>

              </div>
            </div>

          </div>
        ) : (

          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-28 text-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-amber-300" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1c1917] mb-2">Your cart is empty</h2>
              <p className="text-slate-500 text-base max-w-sm mx-auto">
                Looks like you haven't added any snacks yet. Explore our range of guilt-free flavours!
              </p>
            </div>
            <Link
              href="/products"
              className="mt-2 inline-flex items-center gap-2 h-13 px-8 rounded-full bg-[#1c1917] text-white font-bold text-[15px] hover:bg-[#F5A623] hover:text-[#2c1c02] transition-all shadow-md"
            >
              Start Shopping →
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
