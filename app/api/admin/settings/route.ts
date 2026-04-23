import { NextRequest, NextResponse } from "next/server"
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import SiteSettings from "@/lib/models/site-settings"
import { SITE_SETTINGS_KEY, type SiteSettings as SiteSettingsType } from "@/lib/site-settings"
import { normalizeSiteSettings } from "@/lib/site-settings-loader"

async function ensureAdmin(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
  const session = await verifyAuthToken(token)

  if (!session) {
    return { ok: false as const, response: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) }
  }

  if (session.role !== "admin") {
    return { ok: false as const, response: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }) }
  }

  return { ok: true as const }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    const admin = await ensureAdmin(req)
    if (!admin.ok) return admin.response

    const settings = await SiteSettings.findOne({ key: SITE_SETTINGS_KEY }).lean()
    return NextResponse.json({ success: true, data: normalizeSiteSettings(settings) }, { status: 200 })
  } catch (error: unknown) {
    console.error("Failed to fetch admin site settings:", error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase()

    const admin = await ensureAdmin(req)
    if (!admin.ok) return admin.response

    const body = (await req.json()) as Partial<SiteSettingsType>
    const nextSettings = normalizeSiteSettings(body)

    const updated = await SiteSettings.findOneAndUpdate(
      { key: SITE_SETTINGS_KEY },
      { $set: { key: SITE_SETTINGS_KEY, ...nextSettings } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean()

    return NextResponse.json({ success: true, data: normalizeSiteSettings(updated) }, { status: 200 })
  } catch (error: unknown) {
    console.error("Failed to update admin site settings:", error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 })
  }
}
