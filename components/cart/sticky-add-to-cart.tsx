"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface StickyAddToCartProps {
  product: {
    name: string
    price: number
    image: string
  }
  onAddToCart: (quantity: number) => void
}

export function StickyAddToCart({ product, onAddToCart }: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past 400px
      setIsVisible(window.scrollY > 400)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const increaseQuantity = () => {
    if (quantity < 10) setQuantity(quantity + 1)
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm transition-transform duration-300 md:hidden",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="container mx-auto flex items-center gap-3 px-4 py-3">
        {/* Product Preview */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Price */}
        <div className="flex-1">
          <p className="line-clamp-1 text-sm font-medium text-foreground">
            {product.name}
          </p>
          <p className="font-serif text-lg font-bold text-foreground">
            ₹{product.price * quantity}
          </p>
        </div>

        {/* Quantity */}
        <div className="flex items-center rounded-full border bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-6 text-center text-sm font-medium">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={increaseQuantity}
            disabled={quantity >= 10}
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Add to Cart */}
        <Button
          size="sm"
          className="gap-2 rounded-full"
          onClick={() => onAddToCart(quantity)}
        >
          <ShoppingCart className="h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  )
}
