import type { Metadata } from "next"
import React, { Suspense } from "react"
import { Outfit } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { LaunchShell } from "@/components/layout/launch-shell"
import { WhatsAppButton } from "@/components/common/whatsapp-button"
import { absoluteUrl, canonicalUrl, SITE_NAME } from "@/lib/seo"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Crunchley – Healthy Roasted Makhana Snacks",
    template: "%s | Crunchley",
  },
  description:
    "Crunchley crafts premium roasted makhana snacks that are healthy, delicious, and made in India. Guilt-free snacking for every craving.",
  metadataBase: new URL(absoluteUrl("/")),
  applicationName: SITE_NAME,
  keywords: ["makhana", "roasted snacks", "healthy snacks", "foxnuts", "D2C snacks", "India"],
  alternates: {
    canonical: canonicalUrl("/"),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    url: absoluteUrl("/"),
    siteName: "Crunchley",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: absoluteUrl("/brand-og.svg?v=20260414c"),
        alt: "Crunchley",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crunchley – Healthy Roasted Makhana Snacks",
    description:
      "Crunchley crafts premium roasted makhana snacks that are healthy, delicious, and made in India.",
    images: [absoluteUrl("/brand-og.svg?v=20260414c")],
  },
  icons: {
    icon: [{ url: absoluteUrl("/favicon.svg?v=20260414c"), type: "image/svg+xml" }],
    shortcut: [{ url: absoluteUrl("/favicon.svg?v=20260414c") }],
    apple: [{ url: absoluteUrl("/favicon.svg?v=20260414c") }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${outfit.variable} font-sans antialiased`}>
        <Suspense fallback={null}>
          <LaunchShell />
        </Suspense>
        {children}
        <WhatsAppButton />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
