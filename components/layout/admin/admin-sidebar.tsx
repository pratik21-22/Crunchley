"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BriefcaseBusiness,
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  ChevronLeft,
  Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { LogoutButton } from "@/components/common/logout-button"
import { LogoAdmin } from "@/components/common/logo"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Business Enquiries",
    href: "/admin/business-enquiries",
    icon: BriefcaseBusiness,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarWidth = mobileOpen ? "w-[min(86vw,20rem)] lg:w-64" : collapsed ? "w-16" : "w-64"

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        aria-label={mobileOpen ? "Close admin menu" : "Open admin menu"}
        className="fixed left-4 top-4 z-50 rounded-full border border-border bg-card/95 shadow-xl shadow-slate-950/10 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen max-h-screen flex-col border-r border-border bg-card shadow-2xl transition-all duration-300",
          sidebarWidth,
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Logo */}
          <div className={cn(
            "flex min-h-[4.5rem] items-center border-b border-border px-4 py-4",
            collapsed ? "justify-center" : "justify-between"
          )}>
            <div className="flex items-center gap-3 min-w-0">
              {!collapsed ? (
                <LogoAdmin containerClassName="h-10 w-full px-4" className="w-full" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-primary-foreground">C</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn("hidden lg:flex", collapsed && "hidden")}
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/admin" && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex min-h-[3.5rem] items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="mt-auto border-t border-border px-3 py-4">
            <div className={cn(collapsed && "flex justify-center") }>
              <LogoutButton
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground",
                  collapsed && "w-auto justify-center px-2"
                )}
              />
            </div>
          </div>

          {/* Expand button when collapsed */}
          {collapsed && (
            <div className="hidden border-t border-border p-3 lg:block">
              <Button
                variant="ghost"
                size="icon"
                className="w-full"
                onClick={() => setCollapsed(false)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
