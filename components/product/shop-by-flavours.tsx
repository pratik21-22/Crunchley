"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"

const flavours = [
  {
    id: 1,
    name: "Cheese",
    description: "Rich & creamy",
    image: "/images/cheese-makhana.jpg",
    color: "from-yellow-400/20 to-yellow-600/20",
  },
  {
    id: 2,
    name: "Pudina",
    description: "Fresh & minty",
    image: "/images/pudina-makhana.jpg",
    color: "from-green-400/20 to-green-600/20",
  },
  {
    id: 3,
    name: "Peri Peri",
    description: "Bold & spicy",
    image: "/images/peri-peri-makhana.jpg",
    color: "from-red-400/20 to-red-600/20",
  },
  {
    id: 4,
    name: "Tomato",
    description: "Tangy & zesty",
    image: "/images/tomato-makhana.jpg",
    color: "from-orange-400/20 to-orange-600/20",
  },
]

export function ShopByFlavours() {
  return (
    <section id="flavours" className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-primary">
            Explore Tastes
          </span>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            <span className="text-balance">Shop by Flavours</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Find your perfect crunch from our delicious range of flavours
          </p>
        </div>

        {/* Flavours Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {flavours.map((flavour) => (
            <div
              key={flavour.id}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-300 hover:shadow-xl"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={flavour.image}
                  alt={`${flavour.name} flavoured makhana`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/20 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="mb-1 text-xl font-bold text-secondary-foreground">
                  {flavour.name}
                </h3>
                <p className="mb-3 text-sm text-secondary-foreground/80">
                  {flavour.description}
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-secondary-foreground transition-transform duration-300 group-hover:translate-x-2">
                  <span>Shop Now</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
