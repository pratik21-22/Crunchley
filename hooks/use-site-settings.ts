"use client"

import { useEffect, useState } from "react"
import { defaultSiteSettings, type SiteSettings } from "@/lib/site-settings"

type UseSiteSettingsResult = {
  settings: SiteSettings
  loading: boolean
  error: string | null
}

export function useSiteSettings(): UseSiteSettingsResult {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const response = await fetch("/api/site-settings", { cache: "no-store" })
        const payload = (await response.json()) as { success: boolean; data?: SiteSettings; error?: string }

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.error || "Failed to load site settings")
        }

        if (!active) return
        setSettings(payload.data)
        setError(null)
      } catch (err: unknown) {
        if (!active) return
        setSettings(defaultSiteSettings)
        setError(err instanceof Error ? err.message : "Failed to load site settings")
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  return { settings, loading, error }
}
