export type SiteSettings = {
  storeName: string
  supportEmail: string
  supportPhones: string[]
  supportAddress: string
  shippingNote: string
  tagline: string
  helpText: string
  storeMessage: string
  copyrightText: string
  socialInstagram: string
  socialFacebook: string
  socialYoutube: string
  autoConfirmPaidOrders: boolean
  sendShipmentNotifications: boolean
  allowCod: boolean
}

export const SITE_SETTINGS_KEY = "global"

export const defaultSiteSettings: SiteSettings = {
  storeName: "Crunchley",
  supportEmail: "infocrunchley@gmail.com",
  supportPhones: ["+91 8102763281", "+91 748883776", "+91 7644983784"],
  supportAddress: "India, serving pan-India online orders",
  shippingNote: "Orders are dispatched within 24-48 hours across India.",
  tagline: "Roasted, not fried. Guilt-free snacking made irresistibly delicious.",
  helpText: "Questions about products, bulk orders, or shipping? Our team will respond as soon as possible.",
  storeMessage: "Crunchley crafts premium makhana snacks that are healthy, delicious, and made with love in India.",
  copyrightText: "Crunchley Premium Snacks. All rights reserved.",
  socialInstagram: "https://instagram.com",
  socialFacebook: "https://facebook.com",
  socialYoutube: "https://youtube.com",
  autoConfirmPaidOrders: true,
  sendShipmentNotifications: true,
  allowCod: true,
}

