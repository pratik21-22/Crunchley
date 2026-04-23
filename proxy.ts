import { NextRequest, NextResponse } from "next/server"
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth"

const protectedUserRoutes = ["/profile", "/my-orders"]
const protectedAdminPrefix = "/admin"

function isProtectedUserRoute(pathname: string) {
  return protectedUserRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

function isAdminRoute(pathname: string) {
  return pathname === protectedAdminPrefix || pathname.startsWith(`${protectedAdminPrefix}/`)
}

function isAuthRoute(pathname: string) {
  return pathname === "/login" || pathname === "/signup"
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
  const session = await verifyAuthToken(token)

  if (isAuthRoute(pathname) && session) {
    return NextResponse.redirect(new URL(session.role === "admin" ? "/admin/dashboard" : "/profile", req.url))
  }

  if (isProtectedUserRoute(pathname) && !session) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("next", `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdminRoute(pathname)) {
    if (!session) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("next", `${pathname}${search}`)
      return NextResponse.redirect(loginUrl)
    }

    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/access-denied", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/:path*"],
}
