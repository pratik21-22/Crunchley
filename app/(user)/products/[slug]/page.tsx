import { notFound } from "next/navigation"
import connectToDatabase from "@/lib/db"
import Product from "@/lib/models/product"
import { ProductClient } from "./ProductClient";
import type { Metadata } from "next"
import { absoluteUrl, canonicalUrl } from "@/lib/seo"
import { Types } from "mongoose"

export const dynamic = "force-dynamic"
export const revalidate = 0

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function isMongoObjectId(value: string): boolean {
  return Types.ObjectId.isValid(value)
}

interface ProductDetail {
  _id: string
  id: string
  name: string
  slug: string
  price: number
  image: string
  category: string
  description: string
  stock: number
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  await connectToDatabase()
  const normalizedSlug = toSlug(decodeURIComponent(params.slug || ""))
  const product = isMongoObjectId(normalizedSlug)
    ? await Product.findById(normalizedSlug).lean()
    : await Product.findOne({ slug: normalizedSlug }).lean()

  if (!product) {
    return {
      title: "Product Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${product.name} | Crunchley`,
    description: product.description,
    alternates: {
      canonical: canonicalUrl(`/products/${normalizedSlug}`),
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(`/products/${normalizedSlug}`),
      title: `${product.name} | Crunchley`,
      description: product.description,
      images: [
        {
          url: absoluteUrl(product.image),
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  await connectToDatabase()

  // Fetch product securely from Mongoose inside the Server Component
  const normalizedSlug = toSlug(decodeURIComponent(params.slug || ""))
  let product = await Product.findOne({ slug: normalizedSlug }).lean()

  if (!product) {
    const fallbackProducts = await Product.find({}, { name: 1, slug: 1, price: 1, image: 1, category: 1, description: 1, stock: 1 }).lean()
    product = fallbackProducts.find((item) => toSlug(String(item.slug || item.name)) === normalizedSlug) || null
  }

  if (!product) {
    notFound()
  }

  const normalizedProduct: ProductDetail = {
    _id: String(product._id),
    id: String(product._id),
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.image,
    category: product.category,
    description: product.description,
    stock: product.stock,
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: [absoluteUrl(product.image)],
            sku: String(product._id),
            brand: {
              "@type": "Brand",
              name: "Crunchley",
            },
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: product.price,
              availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              url: absoluteUrl(`/products/${normalizedSlug}`),
            },
          }),
        }}
      />
      <ProductClient product={normalizedProduct} />
    </main>
  )
}
