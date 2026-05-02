import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import { AUTH_COOKIE_NAME, createAuthToken, getAuthCookieConfig } from "@/lib/auth"
import { linkGuestOrdersToUser } from "@/lib/guest-orders"
import { normalizePhoneNumber } from "@/lib/phone"
import User from "@/lib/models/user"

interface SignupBody {
  name?: string
  email?: string
  phone?: string
  password?: string
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const body = (await req.json()) as SignupBody
    const name = body.name?.trim()
    const email = body.email ? normalizeEmail(body.email) : ""
    const phone = body.phone ? normalizePhoneNumber(body.phone) : ""
    const password = body.password || ""

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Name, email and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    const existing = await User.findOne({ email }).lean()
    if (existing) {
      return NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 409 })
    }

    if (phone) {
      const existingByPhone = await User.findOne({ phone }).lean()
      if (existingByPhone) {
        return NextResponse.json({ success: false, error: "An account with this mobile number already exists" }, { status: 409 })
      }
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email,
      phone: phone || undefined,
      passwordHash,
      role: "user",
    })

    await linkGuestOrdersToUser({
      userId: String(user._id),
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
    })

    const token = await createAuthToken(
      {
        userId: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      true
    )

    const response = NextResponse.json(
      {
        success: true,
        data: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    )

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieConfig(true))

    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Signup failed"
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
