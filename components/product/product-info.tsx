"use client"

import { useState } from "react"
import { Star, Minus, Plus, ShoppingCart, Zap, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ProductInfoProps {
  product: {
    name: string
    flavor: string
    price: number
    originalPrice: number
    rating: number
    reviewCount: number
    description: string
    inStock: boolean
    badges: string[]
  }
  onAddToCart: (quantity: number) => void
  onBuyNow: (quantity: number) => void
}

export function ProductInfo({ product, onAddToCart, onBuyNow }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const increaseQuantity = () => {
    if (quantity < 10) setQuantity(quantity + 1)
  }

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {product.badges.map((badge) => (
          <Badge
            key={badge}
            variant="secondary"
            className="bg-primary/10 text-primary hover:bg-primary/20"
          >
            {badge}
          </Badge>
        ))}
      </div>

      {/* Title & Flavor */}
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          {product.flavor}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {product.name}
        </h1>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < Math.floor(product.rating)
                  ? "fill-primary text-primary"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        <span className="font-medium text-foreground">{product.rating}</span>
        <span className="text-muted-foreground">
          ({product.reviewCount} reviews)
        </span>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-4xl font-bold text-foreground">
          ₹{product.price}
        </span>
        <span className="text-xl text-muted-foreground line-through">
          ₹{product.originalPrice}
        </span>
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          {discount}% OFF
        </Badge>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            product.inStock ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span
          className={`text-sm font-medium ${
            product.inStock ? "text-green-600" : "text-red-600"
          }`}
        >
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      {/* Short Description */}
      <p className="text-muted-foreground leading-relaxed">
        {product.description}
      </p>

      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground">Quantity:</span>
        <div className="flex items-center rounded-full border bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={increaseQuantity}
            disabled={quantity >= 10}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="flex-1 gap-2 rounded-full text-base"
          onClick={() => onAddToCart(quantity)}
          disabled={!product.inStock}
        >
          <ShoppingCart className="h-5 w-5" />
          Add to Cart
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="flex-1 gap-2 rounded-full text-base"
          onClick={() => onBuyNow(quantity)}
          disabled={!product.inStock}
        >
          <Zap className="h-5 w-5" />
          Buy Now
        </Button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/50 p-4">
        {[
          "Free Shipping over ₹499",
          "100% Natural Ingredients",
          "Easy 7-Day Returns",
          "Secure Payment",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
            <span className="text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
