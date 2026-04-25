import mongoose, { Schema, type Model } from "mongoose"
import { SITE_SETTINGS_KEY, defaultSiteSettings, type SiteSettings } from "@/lib/site-settings"

type SiteSettingsDocument = SiteSettings & {
  key: string
  createdAt: Date
  updatedAt: Date
}

const siteSettingsSchema = new Schema<SiteSettingsDocument>(
  {
    key: { type: String, required: true, unique: true, default: SITE_SETTINGS_KEY },
    storeName: { type: String, required: true, default: defaultSiteSettings.storeName },
    supportEmail: { type: String, required: true, default: defaultSiteSettings.supportEmail },
    supportPhones: { type: [String], required: true, default: defaultSiteSettings.supportPhones },
    supportAddress: { type: String, required: true, default: defaultSiteSettings.supportAddress },
    shippingNote: { type: String, required: true, default: defaultSiteSettings.shippingNote },
    tagline: { type: String, required: true, default: defaultSiteSettings.tagline },
    helpText: { type: String, required: true, default: defaultSiteSettings.helpText },
    storeMessage: { type: String, required: true, default: defaultSiteSettings.storeMessage },
    copyrightText: { type: String, required: true, default: defaultSiteSettings.copyrightText },
    socialInstagram: { type: String, required: true, default: defaultSiteSettings.socialInstagram },
    socialFacebook: { type: String, required: true, default: defaultSiteSettings.socialFacebook },
    socialYoutube: { type: String, required: true, default: defaultSiteSettings.socialYoutube },
    autoConfirmPaidOrders: { type: Boolean, required: true, default: defaultSiteSettings.autoConfirmPaidOrders },
    sendShipmentNotifications: { type: Boolean, required: true, default: defaultSiteSettings.sendShipmentNotifications },
    allowCod: { type: Boolean, required: true, default: defaultSiteSettings.allowCod },
  },
  { timestamps: true }
)

const SiteSettingsModel =
  (mongoose.models.SiteSettings as Model<SiteSettingsDocument>) ||
  mongoose.model<SiteSettingsDocument>("SiteSettings", siteSettingsSchema)

export type { SiteSettingsDocument }
export default SiteSettingsModel
