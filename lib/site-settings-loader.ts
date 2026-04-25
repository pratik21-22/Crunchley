import connectToDatabase from "@/lib/db"
import SiteSettings from "@/lib/models/site-settings"
import { SITE_SETTINGS_KEY, defaultSiteSettings, type SiteSettings as SiteSettingsType } from "@/lib/site-settings"

function sanitizeString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}

function sanitizeStringArray(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value) && value.every(item => typeof item === "string" && item.trim())) {
    return value.map(item => item.trim())
  }
  return fallback
}

function sanitizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

export function normalizeSiteSettings(value: Partial<SiteSettingsType> | null | undefined): SiteSettingsType {
  return {
    storeName: sanitizeString(value?.storeName, defaultSiteSettings.storeName),
    supportEmail: sanitizeString(value?.supportEmail, defaultSiteSettings.supportEmail),
    supportPhones: sanitizeStringArray(value?.supportPhones, defaultSiteSettings.supportPhones),
    supportAddress: sanitizeString(value?.supportAddress, defaultSiteSettings.supportAddress),
    shippingNote: sanitizeString(value?.shippingNote, defaultSiteSettings.shippingNote),
    tagline: sanitizeString(value?.tagline, defaultSiteSettings.tagline),
    helpText: sanitizeString(value?.helpText, defaultSiteSettings.helpText),
    storeMessage: sanitizeString(value?.storeMessage, defaultSiteSettings.storeMessage),
    copyrightText: sanitizeString(value?.copyrightText, defaultSiteSettings.copyrightText),
    socialInstagram: sanitizeString(value?.socialInstagram, defaultSiteSettings.socialInstagram),
    socialFacebook: sanitizeString(value?.socialFacebook, defaultSiteSettings.socialFacebook),
    socialYoutube: sanitizeString(value?.socialYoutube, defaultSiteSettings.socialYoutube),
    autoConfirmPaidOrders: sanitizeBoolean(value?.autoConfirmPaidOrders, defaultSiteSettings.autoConfirmPaidOrders),
    sendShipmentNotifications: sanitizeBoolean(value?.sendShipmentNotifications, defaultSiteSettings.sendShipmentNotifications),
    allowCod: sanitizeBoolean(value?.allowCod, defaultSiteSettings.allowCod),
  }
}

export async function getSiteSettings(): Promise<SiteSettingsType> {
  try {
    await connectToDatabase()
    const settings = await SiteSettings.findOne({ key: SITE_SETTINGS_KEY }).lean()
    return normalizeSiteSettings(settings)
  } catch {
    return defaultSiteSettings
  }
}
