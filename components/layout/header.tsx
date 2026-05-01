"use client"

import { useState, useEffect } from "react"
import { useCartStore } from "@/store/cart"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ShoppingBag, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { LogoHeader, LogoMobile } from "@/components/common/logo"

const navigation = [
  { id: "home", label: "Home", href: "/" },
  { id: "shop", label: "Shop", href: "/products" },
  { id: "bestsellers", label: "Bestsellers", href: "/#bestsellers" },
  { id: "flavours", label: "Flavours", href: "/#flavours" },
  { id: "enquiry", label: "Business Enquiry", href: "/#business-enquiry" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [accountHref, setAccountHref] = useState("/login")
  const [activeSection, setActiveSection] = useState("")

  const pathname = usePathname()
  const cartCount = useCartStore((state) => state.getCartCount())
  const activeNav =
    pathname === "/"
      ? activeSection || "home"
      : pathname.startsWith("/products")
        ? "shop"
        : pathname.startsWith("/cart")
          ? "cart"
          : pathname.startsWith("/profile") || pathname.startsWith("/account") || pathname.startsWith("/my-orders")
            ? "account"
            : ""


  // Initialize and scroll listener
  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("")
      return
    }

    const SECTION_MAP = {
      bestsellers: "bestsellers",
      flavours: "flavours",
      "business-enquiry": "enquiry",
    }

    const elements = Object.entries(SECTION_MAP)
      .map(([id]) => ({ id, element: document.getElementById(id) }))
      .filter((item) => item.element !== null)

    if (elements.length === 0) {
      setActiveSection("")
      return
    }

    const visibleSections = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target.id, entry.intersectionRatio)
          } else {
            visibleSections.delete(entry.target.id)
          }
        })

        let mostVisibleId: string | null = null
        let maxRatio = 0

        visibleSections.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio
            mostVisibleId = id
          }
        })

        if (mostVisibleId && SECTION_MAP[mostVisibleId as keyof typeof SECTION_MAP]) {
          setActiveSection(SECTION_MAP[mostVisibleId as keyof typeof SECTION_MAP])
        } else {
          setActiveSection("")
        }
      },
      {
        threshold: 0.5,
        rootMargin: "-20% 0px -40% 0px",
      }
    )

    elements.forEach((item) => {
      if (item.element) {
        observer.observe(item.element)
      }
    })

    return () => observer.disconnect()
  }, [pathname])

  // Resolve user account route
  useEffect(() => {
    let cancelled = false

    const resolveAccountRoute = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" })
        if (!response.ok) {
          if (!cancelled) setAccountHref("/login")
          return
        }

        const payload = (await response.json()) as {
          success?: boolean
          authenticated?: boolean
          data?: { role?: string }
        }
        if (cancelled) return

        if (!payload.success || !payload.authenticated || !payload.data) {
          setAccountHref("/login")
          return
        }

        setAccountHref(payload?.data?.role === "admin" ? "/admin" : "/profile")
      } catch {
        if (!cancelled) setAccountHref("/login")
      }
    }

    resolveAccountRoute()
    return () => {
      cancelled = true
    }
  }, [])

  // Determine if on account or cart pages
  const isAccountPage = pathname.startsWith("/profile") || pathname.startsWith("/account") || pathname.startsWith("/my-orders") || pathname.startsWith("/access-denied")
  const isCartPage = pathname.startsWith("/cart")

  // Nav item styling
  const navItemBaseClass = "relative inline-flex items-center h-12 px-4 rounded-full text-[15px] font-semibold tracking-[0.01em] transition-all duration-300 whitespace-nowrap z-10 transform"
  const navItemClass = (isActive: boolean) =>
    `${navItemBaseClass} ${
      isActive
        ? "bg-yellow-400 text-[#2c1c02] shadow-[0_12px_28px_rgba(250,204,21,0.32)] font-bold scale-110 text-[16px]"
        : "text-[#3d3427] hover:bg-amber-50 hover:text-[#6b3e00] hover:shadow-[0_8px_20px_rgba(212,144,10,0.08)] hover:scale-[1.03]"
    }`

  const iconClass = (isActive: boolean) =>
    `inline-flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300 z-10 transform ${
      isActive
        ? "bg-yellow-400 text-[#2c1c02] shadow-[0_12px_28px_rgba(250,204,21,0.32)] scale-110"
        : "text-[#3d3427] hover:bg-amber-50 hover:text-[#6b3e00] hover:shadow-[0_8px_20px_rgba(212,144,10,0.08)] hover:scale-[1.03]"
    }`

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-100 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#FFFDF8]/92 backdrop-blur-3xl border-b border-amber-100/80 shadow-[0_12px_32px_rgba(17,24,39,0.1)]"
          : "bg-[#FFFDF8]/84 backdrop-blur-xl border-b border-amber-50/70"
      }`}
    >
      <div className="h-17 flex items-center w-full max-w-350 mx-auto px-4 sm:px-5 lg:px-12">

        {/* LOGO */}
        <Link href="/" className="shrink-0 flex items-center h-full" onClick={() => setIsOpen(false)}>
          <LogoHeader />
        </Link>

        {/* DESKTOP NAV - CENTER */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-2 xl:gap-3">
          {navigation.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={navItemClass(activeNav === item.id)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ICONS - RIGHT ZONE */}
        <div className="hidden lg:flex items-center gap-2 ml-8 shrink-0">
          <Link
            href={accountHref}
            aria-label="My Account"
            className={iconClass(isAccountPage)}
            onClick={() => setIsOpen(false)}
          >
            <User className="h-5 w-5" />
          </Link>

          <Link
            href="/cart"
            aria-label="Shopping Cart"
            className={`${iconClass(isCartPage)} relative`}
            onClick={() => setIsOpen(false)}
          >
            <ShoppingBag className="h-5 w-5" />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFC107] text-[10px] font-extrabold text-black border-2 border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* MOBILE MENU */}
        <div className="lg:hidden ml-auto">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle menu"
                className="size-11 rounded-full text-[#3d3427] hover:bg-amber-100/70 transition-all"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-70 sm:w-[320px] p-0 border-l border-amber-100 bg-[#FFFDF8]">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">Primary site navigation menu</SheetDescription>

              <div className="flex flex-col h-full">

                {/* Drawer header */}
                <div className="flex items-center px-5 h-16 border-b border-amber-50">
                  <Link href="/" onClick={() => setIsOpen(false)}>
                    <LogoMobile />
                  </Link>
                </div>

                {/* Drawer nav items */}
                <nav className="flex-1 flex flex-col gap-1.5 p-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center h-12 px-4 rounded-2xl text-base font-semibold transition-all duration-300 relative ${
                        activeNav === item.id
                          ? "bg-[#FFC107]/20 text-[#6b3e00] shadow-[0_10px_24px_rgba(255,193,7,0.18)] font-bold"
                          : "text-[#3d3427] hover:bg-amber-50 hover:text-[#6b3e00] hover:shadow-[0_8px_20px_rgba(212,144,10,0.08)]"
                      }`}
                    >
                      {item.label}
                      {activeNav === item.id && (
                        <span className="absolute right-4 h-2 w-2 rounded-full bg-[#D4900A]" />
                      )}
                    </Link>
                  ))}
                </nav>

                {/* Drawer footer */}
                <div className="p-4 border-t border-amber-50 space-y-1.5">
                  <Link
                    href={accountHref}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 h-12 px-4 rounded-xl text-base font-semibold text-[#3d3427] hover:bg-amber-50/70 hover:text-[#D4900A] transition-all"
                  >
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 h-12 px-4 rounded-xl text-base font-semibold text-[#3d3427] hover:bg-amber-50/70 hover:text-[#D4900A] transition-all"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Cart
                    {mounted && cartCount > 0 && (
                      <span className="ml-auto bg-[#FFC107] text-[#2c1c02] text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <p className="text-center text-[11px] text-amber-600/60 font-medium tracking-widest uppercase mt-3">
                    Healthy Snacking Made Easy
                  </p>
                </div>

              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  )
}
