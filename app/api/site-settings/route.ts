import { NextResponse } from "next/server"
import { getSiteSettings } from "@/lib/site-settings-loader"

export async function GET() {
  try {
    const settings = await getSiteSettings()
    return NextResponse.json({ success: true, data: settings }, { status: 200 })
  } catch (error: unknown) {
    console.error("Failed to fetch site settings:", error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 })
  }
}

