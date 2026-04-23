"use client"

import Image from "next/image"
import { ShieldCheck, Lock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface CheckoutItem {
  id: string
  name: string
  flavor?: string
  price: number
  quantity: number
  image: string
}

interface CheckoutSummaryProps {
  items: CheckoutItem[]
  subtotal: number
  discount: number
  shipping: number
  total: number
}

export function CheckoutSummary({
  items,
  subtotal,
  discount,
  shipping,
  total,
}: CheckoutSummaryProps) {
  return (
    <Card className="border-0 bg-card shadow-sm">
      <CardContent className="p-6">
        <h2 className="font-serif text-xl font-bold text-foreground">
          Order Summary
        </h2>

        {/* Items */}
        <div className="mt-6 flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative overflow-hidden rounded-lg bg-muted" style={{ height: 64, width: 64, flexShrink: 0 }}>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                  {item.quantity}
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-center">
                {item.flavor && <p className="text-xs text-muted-foreground">{item.flavor}</p>}
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {item.name}
                </p>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-foreground">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        {/* Price Breakdown */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">₹{subtotal}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-green-600">-₹{discount}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-foreground">
              {shipping === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                `₹${shipping}`
              )}
            </span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between">
            <span className="text-lg font-bold text-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">₹{total}</span>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-muted/50 p-3">
          <Lock className="h-4 w-4 text-green-600" />
          <span className="text-sm text-muted-foreground">
            SSL encrypted checkout • Razorpay secured • COD supported
          </span>
        </div>

        {/* Trust Badges */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            100% Safe
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="text-xs text-muted-foreground">
            Fast dispatch from India
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
