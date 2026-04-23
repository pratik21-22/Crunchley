import { ProductCard } from "./product-card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Classic Roasted Makhana",
    slug: "classic-makhana",
    price: 199,
    originalPrice: 249,
    image: "/images/product-bowl.jpg",
  },
  {
    id: 2,
    name: "Cheese Makhana",
    slug: "cheese-makhana",
    price: 229,
    originalPrice: 279,
    image: "/images/cheese-makhana.jpg",
  },
  {
    id: 3,
    name: "Pudina Makhana",
    slug: "pudina-makhana",
    price: 219,
    originalPrice: 269,
    image: "/images/pudina-makhana.jpg",
  },
  {
    id: 4,
    name: "Peri Peri Makhana",
    slug: "peri-peri-makhana",
    price: 229,
    originalPrice: 279,
    image: "/images/peri-peri-makhana.jpg",
  },
]

export function FeaturedProducts() {
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
            <ProductCard key={product.id} product={{ ...product, id: String(product.id) }} />
          ))}
        </div>

      </div>
    </section>
  )
}
