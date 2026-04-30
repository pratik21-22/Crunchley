import type { Metadata } from "next"
import { Inter } from "next/font/google"
import React, { Suspense } from "react"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { LaunchShell } from "@/components/layout/launch-shell"
import { WhatsAppButton } from "@/components/common/whatsapp-button"
import { absoluteUrl, canonicalUrl, SITE_NAME } from "@/lib/seo"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-primary",
  weight: ["400", "500", "600", "700", "800"],
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
      <head>
        <script
          type="module"
          dangerouslySetInnerHTML={{
            __html: `
              import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
              import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'

              const firebaseConfig = {
                apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key'}",
                authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com'}",
                projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project'}",
                storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com'}",
                messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789'}",
                appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef123456'}"
              }

              window.firebaseApp = initializeApp(firebaseConfig)
              window.firebaseAuth = getAuth(window.firebaseApp)
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} font-sans antialiased`}>
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
