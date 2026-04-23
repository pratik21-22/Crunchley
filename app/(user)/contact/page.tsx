import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"
import { getSiteSettings } from "@/lib/site-settings-loader"
import type { Metadata } from "next"
import { absoluteUrl, canonicalUrl } from "@/lib/seo"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return {
    title: `Contact ${settings.storeName}`,
    description: settings.helpText,
    alternates: {
      canonical: canonicalUrl("/contact"),
    },
    openGraph: {
      url: absoluteUrl("/contact"),
      title: `Contact ${settings.storeName}`,
      description: settings.helpText,
      type: "website",
    },
  }
}

export default async function ContactPage() {
  const settings = await getSiteSettings()

  return (
    <main className="min-h-screen bg-[#FFFDF8] pt-20 pb-10">
      <div className="container mx-auto max-w-5xl px-5 md:px-8">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] md:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Contact</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1c1917] md:text-4xl">Get in touch with {settings.storeName}</h1>
          <p className="mt-3 max-w-2xl text-slate-500">
            {settings.helpText}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <a href={`mailto:${settings.supportEmail}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
              <Mail className="h-5 w-5 text-amber-600" />
              <p className="mt-3 text-sm font-bold text-[#1c1917]">Email</p>
              <p className="mt-1 text-sm text-slate-500">{settings.supportEmail}</p>
            </a>

            <a href={`tel:${settings.supportPhone.replace(/\s+/g, "")}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
              <Phone className="h-5 w-5 text-amber-600" />
              <p className="mt-3 text-sm font-bold text-[#1c1917]">Phone</p>
              <p className="mt-1 text-sm text-slate-500">{settings.supportPhone}</p>
            </a>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <MapPin className="h-5 w-5 text-amber-600" />
              <p className="mt-3 text-sm font-bold text-[#1c1917]">Address</p>
              <p className="mt-1 text-sm text-slate-500">{settings.supportAddress}</p>
            </div>
          </div>

          <p className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">{settings.shippingNote}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1c1917] px-6 text-sm font-bold text-white transition-all hover:bg-[#F5A623] hover:text-[#2c1c02]">
              Shop Products
            </Link>
            <Link href="/#business-enquiry" className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:text-[#D4900A]">
              Business Enquiry
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}