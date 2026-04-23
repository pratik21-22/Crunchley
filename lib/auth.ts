import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"

export const AUTH_COOKIE_NAME = "crunchley_auth"

export type AuthRole = "user" | "admin"

export interface AuthSession {
  userId: string
  name: string
  email: string
  role: AuthRole
}

type AuthTokenPayload = AuthSession & {
  rememberMe?: boolean
}

function getFirstEnvValue(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]
    if (value && value.trim()) {
      return value.trim()
    }
  }

  return undefined
}

function getAuthSecret(): string {
  const secret = getFirstEnvValue("AUTH_SECRET", "NEXTAUTH_SECRET")
  if (!secret) {
    throw new Error("Authentication secret is not configured. Set AUTH_SECRET or NEXTAUTH_SECRET in .env.")
  }
  return secret
}

export function getAuthBaseUrl(): string {
  return getFirstEnvValue("AUTH_URL", "NEXTAUTH_URL") || "http://localhost:3000"
}

function getSecretKey() {
  return new TextEncoder().encode(getAuthSecret())
}

export async function createAuthToken(payload: AuthTokenPayload, rememberMe = false): Promise<string> {
  const expiresIn = rememberMe ? "30d" : "7d"

  return new SignJWT({
    userId: payload.userId,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    rememberMe,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey())
}

export async function verifyAuthToken(token?: string | null): Promise<AuthSession | null> {
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecretKey())

    const userId = payload.userId
    const name = payload.name
    const email = payload.email
    const role = payload.role

    if (
      typeof userId !== "string" ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      (role !== "user" && role !== "admin")
    ) {
      return null
    }

    return { userId, name, email, role }
  } catch {
    return null
  }
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  return verifyAuthToken(token)
}

export function getAuthCookieConfig(rememberMe = false) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
  }
}
