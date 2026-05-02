/**
 * Normalize phone numbers to consistent +91 format.
 * Handles various formats (10-digit, with country code, with dashes/spaces).
 * Returns the normalized phone or empty string if invalid.
 */
export function normalizePhoneNumber(phone: unknown): string {
  if (typeof phone !== "string") {
    return ""
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "")

  // If empty after removing non-digits, return empty
  if (!digitsOnly) {
    return ""
  }

  // If it's a 10-digit number (assumed to be India), prepend +91
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`
  }

  // If it's 12 digits and starts with 91, assume it's already in format: 91XXXXXXXXXX
  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return `+${digitsOnly}`
  }

  // If it's 13 digits and starts with 91, it might be +91XXXXXXXXXX (with + as non-digit removed)
  if (digitsOnly.length === 13 && digitsOnly.startsWith("91")) {
    return `+${digitsOnly}`
  }

  // For any 11-digit number that doesn't start with 91, assume it's India (old format without +)
  if (digitsOnly.length === 11 && !digitsOnly.startsWith("91")) {
    // Try to detect if it starts with 0 (old format: 0XXXXXXXXXX)
    if (digitsOnly.startsWith("0")) {
      return `+91${digitsOnly.slice(1)}`
    }
    // Otherwise, assume it's 91 + 10 digits
    return `+91${digitsOnly.slice(-10)}`
  }

  // For any 12-digit number starting with 0, assume it's old format: 091XXXXXXXXXX
  if (digitsOnly.length === 12 && digitsOnly.startsWith("0")) {
    return `+${digitsOnly.slice(1)}`
  }

  // Fallback: if we have exactly 10 digits or a number that looks reasonable, assume India
  if (digitsOnly.length >= 10) {
    const lastTenDigits = digitsOnly.slice(-10)
    return `+91${lastTenDigits}`
  }

  // Invalid phone number
  return ""
}

/**
 * Validate a normalized phone number.
 * Should be in +91XXXXXXXXXX format with exactly 10 digits after +91.
 */
export function isValidNormalizedPhoneNumber(phone: string): boolean {
  return /^\+91\d{10}$/.test(phone)
}
