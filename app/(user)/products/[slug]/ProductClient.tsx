"use client";

import { ProductInfo } from "@/components/product/product-info";
import { toast } from "sonner";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { trackEvent } from "@/lib/analytics";

interface ProductDetail {
  id: string
  _id: string
  name: string
  slug: string
  price: number
  image: string
  category: string
  description: string
  stock: number
}

interface ProductClientProps {
  product: ProductDetail
}

export function ProductClient({ product }: ProductClientProps) {
  const addItem = useCartStore((state) => state.addItem);
  const productId = product._id;

  const handleAddToCart = (quantity: number) => {
    addItem({
      id: productId,
      productId,
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image || "/placeholder.jpg",
      slug: product.slug,
    }, quantity);
    toast.success(`Added ${quantity}x ${product.name} to your cart!`);
    trackEvent("add_to_cart", {
      item_id: product._id?.toString(),
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      quantity,
      currency: "INR",
    });
  };

  const handleBuyNow = (quantity: number) => {
    toast.success(`Proceeding to checkout with ${quantity}x ${product.name}!`);
    trackEvent("begin_checkout", {
      item_id: product._id?.toString(),
      item_name: product.name,
      quantity,
      currency: "INR",
      value: product.price * quantity,
    });
  };

  // Map database fields to the expected format of ProductInfo
  const formattedProduct = {
    name: product.name,
    flavor: product.category, // Assuming category tracks flavor here
    price: product.price,
    originalPrice: Math.round(product.price * 1.25), // Mocking an original price for deals
    rating: 4.8, // Mocked rating until reviews model exists
    reviewCount: 124, 
    description: product.description,
    inStock: product.stock > 0,
    badges: ["Bestseller", "Organic"],
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:gap-16">
      {/* Product Image Side */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted md:sticky md:top-24">
        <Image
          src={product.image || "/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Product Details Side */}
      <div className="py-6">
        <ProductInfo
          product={formattedProduct}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      </div>
    </div>
  );
}
