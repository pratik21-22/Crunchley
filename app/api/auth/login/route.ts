import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import { AUTH_COOKIE_NAME, createAuthToken, getAuthCookieConfig } from "@/lib/auth"
import { linkGuestOrdersToUser } from "@/lib/guest-orders"
import { normalizePhoneNumber } from "@/lib/phone"
import { logAuth, logAuthFailure } from "@/lib/logger"
import User from "@/lib/models/user"
import { checkRateLimit } from "@/lib/rateLimiter"

interface LoginBody {
  identifier?: string
  email?: string
  password?: string
  rememberMe?: boolean
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function isPhoneIdentifier(value: string) {
  return /^\+?[\d\s()-]{8,}$/.test(value)
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 requests per minute per IP for login
    const rl = checkRateLimit(req, "login", 5, 60 * 1000)
    if (!rl.ok) {
      logAuthFailure("/api/auth/login", "rate_limit_exceeded")
      const headers = new Headers()
      headers.set("Retry-After", String(rl.retryAfter || 60))
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429, headers })
    }

    await connectToDatabase()

    const body = (await req.json()) as LoginBody
    const identifierRaw = (body.identifier || body.email || "").trim()
    const password = body.password || ""
    const rememberMe = Boolean(body.rememberMe)

    if (!identifierRaw || !password) {
      logAuthFailure("/api/auth/login", "missing_credentials")
      return NextResponse.json({ success: false, error: "Email/mobile and password are required" }, { status: 400 })
    }

    const query = isPhoneIdentifier(identifierRaw)
      ? { phone: normalizePhoneNumber(identifierRaw) }
      : { email: normalizeEmail(identifierRaw) }

    const user = await User.findOne(query)
    if (!user || !user.passwordHash) {
      logAuthFailure("/api/auth/login", "invalid_credentials", {
        identifier: identifierRaw.slice(-4), // log last 4 chars for debugging
      })
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      logAuthFailure("/api/auth/login", "invalid_credentials", {
        userId: String(user._id),
      })
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

    // Log successful login
    logAuth("/api/auth/login", "email_password", String(user._id), {
      rememberMe,
      email: user.email,
    })

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
