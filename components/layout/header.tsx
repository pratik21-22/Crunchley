"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useCartStore } from "@/store/cart"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, ShoppingBag, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { LogoHeader, LogoMobile } from "@/components/common/logo"
import { NAVIGATION_ITEMS, getActiveNavId } from "@/lib/constants"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [accountHref, setAccountHref] = useState("/login")
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  })

  const pathname = usePathname()
  const router = useRouter()
  const cartCount = useCartStore((state) => state.getCartCount())
  const navContainerRef = useRef<HTMLDivElement>(null)

  // Hash state for mobile or client-side tracking
  const [hash, setHash] = useState("")

  // DERIVED ACTIVE STATE (no setState needed - pure function)
  const activeNavId = useMemo(() => {
    return getActiveNavId(pathname, hash)
  }, [pathname, hash])

  /**
   * CLIENT INITIALIZATION
   * - Set mounted flag
   * - Initialize hash from URL
   * - Setup scroll listener for header background only
   */
  useEffect(() => {
    setMounted(true)

    // Read initial hash from URL
    if (typeof window !== "undefined") {
      setHash(window.location.hash.slice(1))
    }

    // Listen for hash changes
    const handleHashChange = () => {
      if (typeof window !== "undefined") {
        setHash(window.location.hash.slice(1))
      }
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  /**
   * SCROLL LISTENER
   * Only for header background effect, not for active state
   */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll() // Initialize
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /**
   * RESOLVE USER ACCOUNT ROUTE
   * Fetch session to determine if user is logged in as admin or regular user
   */
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

  /**
   * SLIDING INDICATOR
   * Updates position and width to match active nav item
   */
  useEffect(() => {
    const updateIndicator = () => {
      const container = navContainerRef.current
      if (!container || !activeNavId) {
        setIndicatorStyle({ left: 0, width: 0, opacity: 0 })
        return
      }

      const activeElement = container.querySelector<HTMLElement>(`[data-nav-id="${activeNavId}"]`)
      if (!activeElement) {
        setIndicatorStyle({ left: 0, width: 0, opacity: 0 })
        return
      }

      const containerRect = container.getBoundingClientRect()
      const elRect = activeElement.getBoundingClientRect()

      setIndicatorStyle({
        left: elRect.left - containerRect.left,
        width: elRect.width,
        opacity: 1,
      })
    }

    updateIndicator()

    // Recalculate on window resize
    const resizeObserver = new ResizeObserver(updateIndicator)
    const container = navContainerRef.current
    if (container) {
      resizeObserver.observe(container)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [activeNavId, mounted])

  /**
   * HANDLE NAVIGATION ITEM CLICK
   * - For hash links: smooth scroll if on homepage, else navigate with hash
   * - For route links: standard navigation
   */
  const handleNavClick = (e: React.MouseEvent, item: (typeof NAVIGATION_ITEMS)[number]) => {
    setIsOpen(false)

    if (item.type === "route") {
      return // Standard link navigation
    }

    // Hash-based navigation
    if (item.type === "hash") {
      e.preventDefault()

      if (pathname === "/") {
        // On homepage: smooth scroll to section
        const element = document.getElementById(item.section || "")
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
        // Update URL hash
        window.history.replaceState(null, "", `/#${item.section}`)
      } else {
        // Off homepage: navigate to homepage with hash
        router.push(`/#${item.section}`)
      }
    }
  }

  // Determine if we're on account or cart pages for icon highlighting
  const isAccountPage =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/my-orders") ||
    pathname.startsWith("/access-denied")
  const isCartPage = pathname.startsWith("/cart")

  // Base styling for nav items
  const navItemBaseClass =
    "relative inline-flex items-center h-12 px-4 rounded-full text-[15px] font-semibold tracking-[0.01em] transition-colors duration-300 whitespace-nowrap z-10"
  const navItemClass = (isActive: boolean) =>
    `${navItemBaseClass} ${
      isActive ? "text-[#6b3e00]" : "text-[#3d3427] hover:text-[#6b3e00]"
    }`

  const iconClass = (isActive: boolean) =>
    `inline-flex items-center justify-center h-12 w-12 rounded-full transition-colors duration-300 z-10 ${
      isActive ? "text-[#6b3e00]" : "text-[#3d3427] hover:text-[#6b3e00]"
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

        {/* ===== LEFT ZONE: LOGO ===== */}
        <Link
          href="/"
          className="shrink-0 group flex items-center h-full"
          onClick={() => setIsOpen(false)}
        >
          <LogoHeader />
        </Link>

        {/* ===== CENTER ZONE: NAVIGATION ITEMS (DESKTOP ONLY) ===== */}
        <nav
          ref={navContainerRef}
          className="hidden lg:flex flex-1 items-center justify-center gap-1 relative"
          aria-label="Main navigation"
        >
          {/* Sliding indicator */}
          <span
            className="pointer-events-none absolute rounded-full bg-gradient-to-r from-[#FFE082] to-[#FFC107] shadow-[0_14px_30px_rgba(255,193,7,0.22)]"
            style={{
              height: "48px",
              top: "50%",
              transform: `translateX(${indicatorStyle.left}px) translateY(-50%)`,
              width: indicatorStyle.width,
              opacity: indicatorStyle.opacity,
              transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
              willChange: "transform, width",
            }}
          />

          {/* Navigation items */}
          {NAVIGATION_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              data-nav-id={item.id}
              onClick={(e) => handleNavClick(e, item)}
              className={navItemClass(activeNavId === item.id)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ===== RIGHT ZONE: ICONS (ACCOUNT + CART) ===== */}
        <div className="hidden lg:flex items-center gap-2 ml-8 shrink-0 z-10">
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

        {/* ===== MOBILE MENU TRIGGER ===== */}
        <div className="lg:hidden ml-auto">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle navigation menu"
                className="size-11 rounded-full text-[#3d3427] hover:bg-amber-100/70 transition-all duration-250"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>

            {/* ===== MOBILE DRAWER ===== */}
            <SheetContent
              side="right"
              className="w-70 sm:w-[320px] p-0 border-l border-amber-100 bg-[#FFFDF8]"
            >
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Primary site navigation menu
              </SheetDescription>

              <div className="flex flex-col h-full">

                {/* Drawer header */}
                <div className="flex items-center px-5 h-16 border-b border-amber-50">
                  <Link href="/" onClick={() => setIsOpen(false)}>
                    <LogoMobile />
                  </Link>
                </div>

                {/* Drawer nav items */}
                <nav className="flex-1 flex flex-col gap-1.5 p-4" aria-label="Mobile navigation">
                  {NAVIGATION_ITEMS.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item)}
                      className={`flex items-center h-12 px-4 rounded-2xl text-base font-semibold transition-all duration-300 ease-in-out relative group ${
                        activeNavId === item.id
                          ? "bg-gradient-to-r from-[#FDD835] via-[#FFC107] to-[#FFB300] text-[#6b3e00] shadow-[0_14px_30px_rgba(255,179,0,0.18)]"
                          : "text-[#3d3427] hover:bg-amber-50/80 hover:text-[#D4900A]"
                      }`}
                    >
                      {item.label}
                      {activeNavId === item.id && (
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
