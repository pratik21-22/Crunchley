/**
 * Simple in-memory rate limiter.
 * Not distributed — suitable for single-process dev or small deployments.
 */
type Bucket = { count: number; firstSeen: number }

const buckets = new Map<string, Bucket>()

function getIpFromReq(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const real = req.headers.get("x-real-ip")
  if (real) return real
  return "unknown"
}

export function checkRateLimit(
  req: Request,
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfter?: number; remaining?: number } {
  const ip = getIpFromReq(req)
  const bucketKey = `${ip}:${key}`
  const now = Date.now()
  const existing = buckets.get(bucketKey)

  if (!existing) {
    buckets.set(bucketKey, { count: 1, firstSeen: now })
    return { ok: true, remaining: limit - 1 }
  }

  if (now - existing.firstSeen > windowMs) {
    // reset window
    buckets.set(bucketKey, { count: 1, firstSeen: now })
    return { ok: true, remaining: limit - 1 }
  }

  if (existing.count + 1 > limit) {
    const retryAfterMs = windowMs - (now - existing.firstSeen)
    const retryAfter = Math.ceil(retryAfterMs / 1000)
    return { ok: false, retryAfter }
  }

  existing.count += 1
  buckets.set(bucketKey, existing)
  return { ok: true, remaining: Math.max(0, limit - existing.count) }
}

// For testing or admin: ability to clear buckets (not exported by default)
export function _resetBuckets() {
  buckets.clear()
}

export default { checkRateLimit }
