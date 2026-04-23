export const SITE_NAME = "Crunchley"

export function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (siteUrl) {
    return siteUrl.replace(/\/$/, "")
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://crunchley.in"
}

export function absoluteUrl(pathname: string) {
  return new URL(pathname.startsWith("/") ? pathname : `/${pathname}`, getSiteUrl()).toString()
}

export function canonicalUrl(pathname: string) {
  return absoluteUrl(pathname)
}