import type { MetadataRoute } from "next"
import connectToDatabase from "@/lib/db"
import Product from "@/lib/models/product"
import { absoluteUrl, getSiteUrl } from "@/lib/seo"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()

  let products: Array<{ slug: string; updatedAt?: Date }> = []
  try {
    await connectToDatabase()
    const rows = await Product.find({}, { slug: 1, updatedAt: 1 }).lean()
    products = rows.map((row) => ({ slug: String(row.slug), updatedAt: row.updatedAt }))
  } catch {
    products = []
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/products"), lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/contact"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/track-order"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.4 },
    { url: absoluteUrl("/faq"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/shipping"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/privacy"), lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ]

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified: product.updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes]
}
