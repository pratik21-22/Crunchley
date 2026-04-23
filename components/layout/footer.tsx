"use client"

import Link from "next/link"
import { Instagram, Twitter, ArrowRight, Mail, Phone, MapPin } from "lucide-react"
import { useSiteSettings } from "@/hooks/use-site-settings"
import { LogoFooter } from "@/components/common/logo"

const links = {
  shop: [
    { name: "All Products",    href: "/products" },
    { name: "Bestsellers",     href: "/#bestsellers" },
    { name: "Shop by Flavour", href: "/#flavours" },
    { name: "New Arrivals",    href: "/products" },
  ],
  support: [
    { name: "Contact",         href: "/contact" },
    { name: "Track Order",      href: "/track-order" },
    { name: "Business Enquiry", href: "/#business-enquiry" },
    { name: "FAQs",             href: "/faq" },
    { name: "Shipping Info",    href: "/shipping" },
    { name: "Return & Refund Policy", href: "/returns" },
    { name: "Privacy Policy",   href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
}

export function Footer() {
  const { settings, loading } = useSiteSettings()

  const footerEmail = "infocrunchley@gmail.com"
  const footerPhone = "8102763281"
  const footerAddress = "Anandpuri Ward No. 23, Shivpuri, Purnia, Bihar 854301"

  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/crunchley_india/", label: "Instagram" },
    { icon: Twitter, href: "https://x.com/CrunchleyIndia", label: "X" },
  ]

  return (
    <footer className="bg-[#1c1917] text-white">

      {/* ── Top strip ── */}
      <div className="border-b border-white/8">
        <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-white/60 text-center sm:text-left">
            🎉 Free shipping on orders above <span className="text-[#FFC107] font-bold">₹499</span>. Shop now and save!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#FFC107] hover:text-[#FFD740] transition-colors group"
          >
            Shop All Flavours <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── Main footer body ── */}
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl py-14 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand col */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-5">
            {/* Logo for dark background */}
            <LogoFooter />

            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              {settings.storeMessage}
            </p>

            {/* Social icons */}
            <div className="flex gap-2 mt-1">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/8 hover:bg-[#FFC107]/20 hover:text-[#FFC107] flex items-center justify-center transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <div className="space-y-2 text-xs text-white/55">
              <p className="inline-flex items-start gap-2">
                <Mail className="mt-0.5 h-3.5 w-3.5 text-[#FFC107]" />
                <a href={`mailto:${footerEmail}`} className="hover:text-white transition-colors">
                  {loading ? "Loading contact..." : footerEmail}
                </a>
              </p>
              <p className="inline-flex items-start gap-2">
                <Phone className="mt-0.5 h-3.5 w-3.5 text-[#FFC107]" />
                <a href={`tel:${footerPhone}`} className="hover:text-white transition-colors">
                  {loading ? "Loading contact..." : footerPhone}
                </a>
              </p>
              <p className="inline-flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 text-[#FFC107]" />
                <span>{loading ? "Loading address..." : footerAddress}</span>
              </p>
            </div>
          </div>

          {/* Shop links */}
          <div className="flex flex-col gap-5">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">Shop</h4>
            <ul className="flex flex-col gap-3">
              {links.shop.map((l) => (
                <li key={l.name}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/50 hover:text-[#FFC107] transition-colors duration-150"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div className="flex flex-col gap-5">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">Support</h4>
            <ul className="flex flex-col gap-3">
              {links.support.map((l) => (
                <li key={l.name}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/50 hover:text-[#FFC107] transition-colors duration-150"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-5">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">Stay in the Loop</h4>
            <p className="text-sm text-white/50 leading-relaxed">
              Get exclusive deals, new launches, and snack tips delivered to your inbox.
            </p>
            <form className="flex flex-col gap-2.5" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                required
                suppressHydrationWarning
                className="h-11 w-full rounded-xl border border-white/10 bg-white/8 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFC107]/50 focus:ring-1 focus:ring-[#FFC107]/30 transition-all"
              />
              <button
                type="submit"
                suppressHydrationWarning
                className="h-11 w-full rounded-xl bg-[#FFC107] text-[#1c1917] text-sm font-bold hover:bg-[#FFD740] active:scale-[0.98] transition-all"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/8">
        <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/35 text-center sm:text-left">
            © {new Date().getFullYear()} {settings.copyrightText}
          </p>
          <div className="flex items-center gap-5">
            <Link href="/terms"   className="text-xs text-white/35 hover:text-white/70 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-xs text-white/35 hover:text-white/70 transition-colors">Privacy</Link>
            <span className="text-xs text-white/35">🇮🇳 Made in India</span>
          </div>
        </div>
      </div>

    </footer>
  )
}
