"use client"

import Link from "next/link"
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface OrderSummaryProps {
  subtotal: number
  discount: number
  shipping: number
  total: number
  itemCount: number
  showCheckoutButton?: boolean
}

export function OrderSummary({
  subtotal,
  discount,
  shipping,
  total,
  itemCount,
  showCheckoutButton = true,
}: OrderSummaryProps) {
  return (
    <Card className="border-0 bg-card shadow-sm">
      <CardContent className="p-6">
        <h2 className="font-serif text-xl font-bold text-foreground">
          Order Summary
        </h2>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Subtotal ({itemCount} items)
            </span>
            <span className="font-medium text-foreground">₹{subtotal}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium text-green-600">-₹{discount}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium text-foreground">
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

          {discount > 0 && (
            <p className="text-center text-sm text-green-600">
              You&apos;re saving ₹{discount} on this order!
            </p>
          )}
        </div>

        {showCheckoutButton && (
          <Link href="/checkout" className="mt-6 block">
            <Button className="w-full gap-2 rounded-full text-base" size="lg">
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}

        {/* Trust Badges */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: Truck, label: "Free Shipping" },
            { icon: ShieldCheck, label: "Secure Payment" },
            { icon: RotateCcw, label: "Easy Returns" },
          ].map((badge) => (
            <div key={badge.label} className="flex flex-col items-center gap-1 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <badge.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
