import { HeroSection } from "@/components/home/hero-section"
import { FeaturedProducts } from "@/components/product/featured-products"
import { ShopByFlavour } from "@/components/home/shop-by-flavour"
import { BusinessEnquirySection } from "@/components/home/business-enquiry-section"
import { getSiteSettings } from "@/lib/site-settings-loader"
import type { Metadata } from "next"
import { absoluteUrl, canonicalUrl } from "@/lib/seo"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return {
    title: settings.storeName,
    description: settings.tagline,
    alternates: {
      canonical: canonicalUrl("/"),
    },
    openGraph: {
      url: absoluteUrl("/"),
      title: settings.storeName,
      description: settings.tagline,
      type: "website",
      images: [
        {
          url: absoluteUrl("/brand-og.svg?v=20260414c"),
          alt: settings.storeName,
        },
      ],
    },
  }
}

export default async function HomePage() {
  const settings = await getSiteSettings()

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection tagline={settings.tagline} />
      <FeaturedProducts />
      <ShopByFlavour />
      <BusinessEnquirySection contactEmail={settings.supportEmail} contactPhone={settings.supportPhone} />
    </div>
  )
}
