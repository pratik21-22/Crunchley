import { jwtVerify, SignJWT } from "jose"

type OrderAccessTokenPayload = {
  type: "order-access"
  orderId: string
  email: string
  phone: string
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret || !secret.trim()) {
    throw new Error("Authentication secret is not configured. Set AUTH_SECRET or NEXTAUTH_SECRET in .env.")
  }
  return secret.trim()
}

function getSecretKey() {
  return new TextEncoder().encode(getAuthSecret())
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "")
}

export async function createOrderAccessToken(input: {
  orderId: string
  email: string
  phone: string
}): Promise<string> {
  return new SignJWT({
    type: "order-access",
    orderId: input.orderId,
    email: normalizeEmail(input.email),
    phone: normalizePhone(input.phone),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey())
}

export async function verifyOrderAccessToken(
  token?: string | null
): Promise<OrderAccessTokenPayload | null> {
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    const type = payload.type
    const orderId = payload.orderId
    const email = payload.email
    const phone = payload.phone

    if (
      type !== "order-access" ||
      typeof orderId !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string"
    ) {
      return null
    }

    return {
      type: "order-access",
      orderId,
      email: normalizeEmail(email),
      phone: normalizePhone(phone),
    }
  } catch {
    return null
  }
}

export function normalizeGuestEmail(email: string): string {
  return normalizeEmail(email)
}

export function normalizeGuestPhone(phone: string): string {
  return normalizePhone(phone)
}
