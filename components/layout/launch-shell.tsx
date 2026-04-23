"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Analytics } from "@/components/common/analytics"
import { Analytics as VercelAnalytics } from "@vercel/analytics/react"

export function LaunchShell() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.route = pathname
    }
  }, [pathname])

  return (
    <>
      <Analytics />
      {process.env.NODE_ENV === "production" ? <VercelAnalytics /> : null}
    </>
  )
}