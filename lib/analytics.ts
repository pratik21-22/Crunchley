type AnalyticsValue = string | number | boolean | null | undefined

export type AnalyticsParams = Record<string, AnalyticsValue>

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
    gtag?: (...args: unknown[]) => void
  }
}

function pushToDataLayer(event: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") {
    return
  }

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...params })

  if (typeof window.gtag === "function") {
    window.gtag("event", event, params)
  }
}

export function trackEvent(event: string, params: AnalyticsParams = {}) {
  pushToDataLayer(event, params)
}

export function trackPageView(pathname: string, title?: string) {
  pushToDataLayer("page_view", {
    page_path: pathname,
    page_location: typeof window !== "undefined" ? window.location.href : undefined,
    page_title: title,
  })
}
