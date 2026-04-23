import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import { AUTH_COOKIE_NAME, createAuthToken, getAuthCookieConfig } from "@/lib/auth"
import { linkGuestOrdersToUser } from "@/lib/guest-orders"
import User from "@/lib/models/user"

interface LoginBody {
  identifier?: string
  email?: string
  password?: string
  rememberMe?: boolean
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "")
}

function isPhoneIdentifier(value: string) {
  return /^\+?[\d\s()-]{8,}$/.test(value)
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const body = (await req.json()) as LoginBody
    const identifierRaw = (body.identifier || body.email || "").trim()
    const password = body.password || ""
    const rememberMe = Boolean(body.rememberMe)

    if (!identifierRaw || !password) {
      return NextResponse.json({ success: false, error: "Email/mobile and password are required" }, { status: 400 })
    }

    const query = isPhoneIdentifier(identifierRaw)
      ? { phone: normalizePhone(identifierRaw) }
      : { email: normalizeEmail(identifierRaw) }

    const user = await User.findOne(query)
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

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
      rememberMe
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
      { status: 200 }
    )

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieConfig(rememberMe))

    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed"
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
