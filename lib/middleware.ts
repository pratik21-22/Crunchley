import { NextRequest, NextResponse } from "next/server"
import { AUTH_COOKIE_NAME, verifyAuthToken, type AuthSession } from "@/lib/auth"

/**
 * Middleware helper: Extract and verify auth token from request cookies.
 * Returns { session, error, response } where:
 *  - session: AuthSession if valid
 *  - error: error message if invalid
 *  - response: NextResponse to return on error (401/403)
 *
 * Usage in route handlers:
 *   const auth = await requireAuth(req)
 *   if (!auth.session) return auth.response
 *   // use auth.session
 */
export async function requireAuth(req: NextRequest): Promise<{
  session: AuthSession | null
  error: string | null
  response: NextResponse | null
}> {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
    const session = await verifyAuthToken(token)

    if (!session) {
      return {
        session: null,
        error: "Unauthorized",
        response: NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        ),
      }
    }

    return {
      session,
      error: null,
      response: null,
    }
  } catch (error: unknown) {
    return {
      session: null,
      error: error instanceof Error ? error.message : "Auth verification failed",
      response: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    }
  }
}

/**
 * Middleware helper: Verify auth + admin role.
 * Returns { session, error, response } where:
 *  - session: AuthSession if valid and admin
 *  - error: error message if invalid or not admin
 *  - response: NextResponse to return on error (401/403)
 *
 * Usage in route handlers:
 *   const auth = await requireAdmin(req)
 *   if (!auth.session) return auth.response
 *   // use auth.session (guaranteed to be admin)
 */
export async function requireAdmin(req: NextRequest): Promise<{
  session: AuthSession | null
  error: string | null
  response: NextResponse | null
}> {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
    const session = await verifyAuthToken(token)

    if (!session) {
      return {
        session: null,
        error: "Unauthorized",
        response: NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        ),
      }
    }

    if (session.role !== "admin") {
      return {
        session: null,
        error: "Forbidden",
        response: NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 }
        ),
      }
    }

    return {
      session,
      error: null,
      response: null,
    }
  } catch (error: unknown) {
    return {
      session: null,
      error: error instanceof Error ? error.message : "Auth verification failed",
      response: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    }
  }
}
