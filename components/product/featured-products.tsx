import connectToDatabase from "@/lib/db"
import Product from "@/lib/models/product"
import { ProductCard } from "./product-card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export async function FeaturedProducts() {
  await connectToDatabase()

  const products = await Product.find({}).sort({ createdAt: -1 }).limit(4).lean()

  return (
    <section id="bestsellers" className="bg-[#FFFDF8] py-16 md:py-24 border-t border-amber-50">
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-amber-600 mb-2">Most Loved</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[#1c1917]">
              Bestsellers
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[14px] font-bold text-[#D4900A] hover:gap-3 transition-all duration-200 group self-start sm:self-auto"
          >
            View All Products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={String(product._id)}
              product={{
                id: String(product._id),
                _id: String(product._id),
                name: product.name,
                slug: product.slug,
                price: product.price,
                originalPrice: product.originalPrice ?? Math.round(product.price * 1.25),
                image: product.image,
                badge: product.badge,
                category: product.category,
                description: product.description,
              }}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
