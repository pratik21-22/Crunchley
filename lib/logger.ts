/**
 * Structured logging utility for consistent log formatting.
 * Outputs JSON-style logs with action, route, userId, timestamp, and metadata.
 */

export type LogLevel = "info" | "error" | "warn" | "debug"

export interface LogEntry {
  timestamp: string
  level: LogLevel
  action: string
  route: string
  userId?: string
  metadata?: Record<string, unknown>
}

function formatLog(entry: LogEntry): string {
  return JSON.stringify(entry)
}

/**
 * Log a structured event.
 * @param action - Action performed (e.g., "login", "order_created")
 * @param route - API route (e.g., "/api/auth/login")
 * @param level - Log level (default: "info")
 * @param userId - Optional user ID
 * @param metadata - Optional additional data
 */
export function log(
  action: string,
  route: string,
  level: LogLevel = "info",
  userId?: string,
  metadata?: Record<string, unknown>
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    action,
    route,
    ...(userId && { userId }),
    ...(metadata && { metadata }),
  }

  const formatted = formatLog(entry)

  // Use appropriate console method based on level
  switch (level) {
    case "error":
      console.error(formatted)
      break
    case "warn":
      console.warn(formatted)
      break
    case "debug":
      console.debug(formatted)
      break
    case "info":
    default:
      console.log(formatted)
  }
}

/**
 * Log a successful authentication.
 */
export function logAuth(
  route: string,
  authMethod: string,
  userId: string,
  metadata?: Record<string, unknown>
): void {
  log("auth_success", route, "info", userId, {
    authMethod,
    ...metadata,
  })
}

/**
 * Log a failed authentication attempt.
 */
export function logAuthFailure(
  route: string,
  reason: string,
  metadata?: Record<string, unknown>
): void {
  log("auth_failure", route, "warn", undefined, {
    reason,
    ...metadata,
  })
}

/**
 * Log an order creation event.
 */
export function logOrderCreated(
  route: string,
  orderId: string,
  userId: string | undefined,
  total: number,
  itemCount: number,
  metadata?: Record<string, unknown>
): void {
  log("order_created", route, "info", userId, {
    orderId,
    total,
    itemCount,
    ...metadata,
  })
}

/**
 * Log a payment verification event.
 */
export function logPaymentVerified(
  route: string,
  orderId: string,
  userId: string | undefined,
  paymentId: string,
  amount: number,
  metadata?: Record<string, unknown>
): void {
  log("payment_verified", route, "info", userId, {
    orderId,
    paymentId,
    amount,
    ...metadata,
  })
}

/**
 * Log a payment failure event.
 */
export function logPaymentFailure(
  route: string,
  orderId: string,
  userId: string | undefined,
  reason: string,
  metadata?: Record<string, unknown>
): void {
  log("payment_failure", route, "error", userId, {
    orderId,
    reason,
    ...metadata,
  })
}

export default {
  log,
  logAuth,
  logAuthFailure,
  logOrderCreated,
  logPaymentVerified,
  logPaymentFailure,
}
