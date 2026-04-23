import crypto from "crypto"
import Razorpay from "razorpay"

const currency = "INR"

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not configured`)
  }
  return value
}

export function getRazorpayConfig() {
  return {
    keyId: getRequiredEnv("RAZORPAY_KEY_ID"),
    keySecret: getRequiredEnv("RAZORPAY_KEY_SECRET"),
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    currency,
  }
}

export function createRazorpayClient() {
  const { keyId, keySecret } = getRazorpayConfig()
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

export function toPaise(amount: number): number {
  return Math.round(amount * 100)
}

export function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}): boolean {
  const { keySecret } = getRazorpayConfig()
  const data = `${razorpayOrderId}|${razorpayPaymentId}`
  const digest = crypto.createHmac("sha256", keySecret).update(data).digest("hex")
  return digest === razorpaySignature
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const { webhookSecret } = getRazorpayConfig()
  if (!webhookSecret) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured")
  }

  const digest = crypto.createHmac("sha256", webhookSecret).update(payload).digest("hex")
  return digest === signature
}

export const RAZORPAY_CURRENCY = currency
