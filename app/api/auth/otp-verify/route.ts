import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import { normalizePhoneNumber } from "@/lib/phone"
import User from "@/lib/models/user"
import { createAuthToken } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rateLimiter"

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 requests per minute per IP for OTP verification
    const rl = checkRateLimit(req, "otp-verify", 3, 60 * 1000)
    if (!rl.ok) {
      const headers = new Headers()
      headers.set("Retry-After", String(rl.retryAfter || 60))
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429, headers })
    }

    await connectToDatabase()

    const body = await req.json()
    const { uid, phoneNumber, displayName, email } = body

    if (!uid || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: "Firebase UID and phone number are required" },
        { status: 400 }
      )
    }

    // Normalize phone number to consistent format
    const normalizedPhone = normalizePhoneNumber(phoneNumber)
    if (!normalizedPhone) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format" },
        { status: 400 }
      )
    }

    // Check if user already exists with this phone number
    let user = await User.findOne({ phone: normalizedPhone })

    if (!user) {
      // Create new user
      user = new User({
        firebaseUid: uid,
        name: displayName || "Phone User",
        email: email || `${normalizedPhone}@phone.local`,
        phone: normalizedPhone,
        role: "user",
        isPhoneVerified: true,
      })
      await user.save()
    } else {
      // Update existing user with Firebase UID if not set
      if (!user.firebaseUid) {
        user.firebaseUid = uid
        user.isPhoneVerified = true
        await user.save()
      }
    }

    // Create auth token
    const token = await createAuthToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    })

    // Set auth cookie
    const response = NextResponse.json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set("crunchley_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "OTP verification failed"
    console.error("OTP verification error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}