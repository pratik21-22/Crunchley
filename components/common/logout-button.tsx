"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { toast } from "sonner"

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" })
      if (!res.ok) throw new Error("Failed to logout")
      toast.success("Logged out successfully")
      router.push("/login")
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to logout"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
      suppressHydrationWarning
    >
      <LogOut className="h-4 w-4" />
      {isLoading ? "Signing out..." : "Logout"}
    </button>
  )
}
