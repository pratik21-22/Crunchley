"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronsUpDown, LogOut, Search, Settings, ShieldCheck, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SessionResponse = {
  success: boolean
  authenticated?: boolean
  data?: {
    name: string
    email: string
    role: string
  }
}

interface AdminHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function AdminHeader({ title, description, action }: AdminHeaderProps) {
  const router = useRouter()
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [session, setSession] = useState<{ name: string; email: string; role: string } | null>(null)

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" })
        if (!response.ok) {
          if (active) setSession(null)
          return
        }

        const payload = (await response.json()) as SessionResponse
        if (active && payload.success && payload.authenticated && payload.data) {
          setSession(payload.data)
          return
        }

        if (active) setSession(null)
      } catch {
        if (active) setSession(null)
      }
    }

    loadSession()

    return () => {
      active = false
    }
  }, [])

  const handleLogout = async () => {
    if (logoutLoading) return
    setLogoutLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    } finally {
      setLogoutLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 lg:gap-4 lg:px-6">
        {/* Title Section */}
        <div className="min-w-0 flex-1 pl-12 lg:pl-0">
          <h1 className="truncate text-lg font-semibold text-foreground lg:text-xl">
            {title}
          </h1>
          {description && (
            <p className="truncate text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search - Hidden on mobile */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders, products, customers..."
              className="w-64 rounded-full border-slate-200 pl-9 transition-all focus-visible:w-72"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 min-w-42.5 justify-between rounded-full border-slate-200 px-2.5 text-left">
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <span className="hidden sm:block min-w-0">
                    <span className="block truncate text-xs font-semibold text-slate-900">{session?.name || "Admin"}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{session?.role || "admin"}</span>
                  </span>
                </span>
                <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-900">{session?.name || "Crunchley Admin"}</p>
                <p className="text-xs text-muted-foreground truncate">{session?.email || "admin@crunchley.in"}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="cursor-pointer">
                  <ShieldCheck className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600"
                disabled={logoutLoading}
              >
                <LogOut className="h-4 w-4" />
                {logoutLoading ? "Signing out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Action Button */}
          {action}
        </div>
      </div>
    </header>
  )
}
