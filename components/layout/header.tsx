"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useCartStore } from "@/store/cart"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, ShoppingBag, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { LogoHeader, LogoMobile } from "@/components/common/logo"

type NavItemId = "home" | "shop" | "bestsellers" | "flavours" | "enquiry" | "cart" | "account" | "none"

const navigation = [
  { id: "home" as NavItemId,          name: "Home",             href: "/",                     section: null },
  { id: "shop" as NavItemId,          name: "Shop",             href: "/products",             section: null },
  { id: "bestsellers" as NavItemId,   name: "Bestsellers",      href: "/#bestsellers",         section: "bestsellers" },
  { id: "flavours" as NavItemId,      name: "Flavours",         href: "/#flavours",            section: "flavours" },
  { id: "enquiry" as NavItemId,       name: "Business Enquiry", href: "/#business-enquiry",   section: "business-enquiry" },
]

function NavLink({
  item,
  onClick,
  isActive,
}: {
  item: (typeof navigation)[number]
  onClick: (e: React.MouseEvent, item: (typeof navigation)[number]) => void
  isActive: boolean
}) {
  return (
    <Link
      href={item.href}
      onClick={(e) => onClick(e, item)}
      className={`relative inline-flex items-center rounded-full px-4 py-2 text-[15px] font-semibold tracking-[0.01em] transition-all duration-300 ease-in-out transform whitespace-nowrap group ${
        isActive
          ? "bg-gradient-to-r from-[#FDD835] via-[#FFC107] to-[#FFB300] text-[#6b3e00] shadow-[0_16px_40px_rgba(255,179,0,0.18)] -translate-y-0.5"
          : "text-[#3d3427] hover:bg-amber-50/90 hover:text-[#D4900A] hover:shadow-[0_8px_24px_rgba(212,144,10,0.1)]"
      }`}
    >
      {item.name}
      <span
        className={`absolute -bottom-0.5 left-1/2 h-[2.5px] -translate-x-1/2 rounded-full bg-linear-to-r from-[#FFD000] to-[#F5A623] transition-all duration-300 ${
          isActive ? "w-2/3 opacity-100 shadow-[0_2px_8px_rgba(245,166,35,0.4)]" : "w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-50"
        }`}
      />
    </Link>
  )
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const cartCount = useCartStore((state) => state.getCartCount())
  const [activeNav, setActiveNav] = useState<NavItemId>(() =>
    pathname.startsWith("/products")
      ? "shop"
      : pathname.startsWith("/cart")
      ? "cart"
      : pathname.startsWith("/profile") || pathname.startsWith("/account") || pathname.startsWith("/my-orders")
      ? "account"
      : pathname === "/"
      ? "home"
      : "none"
  )
  const navContainerRef = useRef<HTMLDivElement | null>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  })
  const isClickScrolling = useRef(false)
  const clickScrollTimeout = useRef<NodeJS.Timeout | null>(null)
  const [accountHref, setAccountHref] = useState("/login")

  // Scroll listener for header background
  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /**
   * ROBUST ACTIVE STATE DETECTION
   * 1. Uses throttling & getBoundingClientRect for bulletproof height independence.
   * 2. Bypasses observer when 'isClickScrolling' is true to prevent jumps.
   * 3. Checks from bottom to top to handle rapid scrolling natively.
   */
  useEffect(() => {
    if (pathname.startsWith("/products")) {
      setActiveNav("shop")
      return
    }

    if (pathname.startsWith("/cart")) {
      setActiveNav("cart")
      return
    }

    if (pathname.startsWith("/profile") || pathname.startsWith("/account") || pathname.startsWith("/my-orders")) {
      setActiveNav("account")
      return
    }

    if (pathname !== "/") {
      setActiveNav("none")
      return
    }

    const HEADER_HEIGHT = 68 // h-17 in pixels
    const sectionIds: NavItemId[] = ["home", "bestsellers", "flavours", "enquiry"]
    let ticking = false

    const hash = window.location.hash.slice(1)
    if (hash === "bestsellers" || hash === "flavours") {
      setActiveNav(hash as NavItemId)
    } else if (hash === "business-enquiry") {
      setActiveNav("enquiry")
    } else {
      setActiveNav("home")
    }

    const sectionIdMap: Partial<Record<NavItemId, string>> = {
      home: "home",
      shop: "shop",
      bestsellers: "bestsellers",
      flavours: "flavours",
      enquiry: "business-enquiry",
      none: "home",
    }

    const evaluateActiveSection = () => {
      if (isClickScrolling.current) return

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
        setActiveNav("enquiry")
        return
      }

      const reversedIds = [...sectionIds].reverse()
      let found = false

      for (const navId of reversedIds) {
        const elementId = sectionIdMap[navId]
        if (!elementId) continue

        const element = document.getElementById(elementId)
        if (element) {
          const { top } = element.getBoundingClientRect()
          if (top <= HEADER_HEIGHT + 120) {
            setActiveNav(navId)
            found = true
            break
          }
        }
      }

      if (!found) setActiveNav("home")
    }

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          evaluateActiveSection()
          ticking = false
        })
        ticking = true
      }
    }

    setTimeout(evaluateActiveSection, 100)
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
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

  const handleNavClick = useCallback(
    (e: React.MouseEvent, item: (typeof navigation)[number]) => {
      setIsOpen(false)

      if (!item.section) {
        setActiveNav(item.id)
        return
      }

      // Section links: smooth scroll if on homepage, or navigate with hash
      e.preventDefault()
      
      // Prevent scroll spy from updating during smooth scroll
      isClickScrolling.current = true
      setActiveNav(item.id)
      
      if (clickScrollTimeout.current) clearTimeout(clickScrollTimeout.current)
      clickScrollTimeout.current = setTimeout(() => {
        isClickScrolling.current = false
      }, 1000)

      if (pathname === "/") {
        const element = document.getElementById(item.section)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
        // Update URL hash without jumping
        window.history.pushState(null, "", `/#${item.section}`)
      } else {
        router.push(`/#${item.section}`)
      }
    },
    [pathname, router]
  )

  const isAccountPage = pathname.startsWith("/profile") || pathname.startsWith("/account") || pathname.startsWith("/my-orders")
  const isCartPage = pathname.startsWith("/cart")

  const navItemBaseClass =
    "relative inline-flex items-center justify-center rounded-full px-4 py-2 h-12 text-[15px] font-semibold tracking-[0.01em] transition-all duration-300 ease-in-out whitespace-nowrap z-10"
  const navItemClass = (isActive: boolean) =>
    `${navItemBaseClass} ${isActive ? "text-[#6b3e00]" : "text-[#3d3427] hover:text-[#6b3e00]"}`

  const updateIndicator = () => {
    const container = navContainerRef.current
    const activeElement = activeNav !== "none" ? container?.querySelector<HTMLElement>(`[data-nav-item="${activeNav}"]`) : null

    if (container && activeElement) {
      const containerRect = container.getBoundingClientRect()
      const elRect = activeElement.getBoundingClientRect()
      const paddingAdjustment = 12 // px-4 py-2 padding adjustment
      setIndicatorStyle({
        left: elRect.left - containerRect.left - 6,
        width: elRect.width + paddingAdjustment,
        opacity: 1,
      })
      return
    }

    setIndicatorStyle({ left: 0, width: 0, opacity: 0 })
  }

  useEffect(() => {
    updateIndicator()
    window.addEventListener("resize", updateIndicator)
    return () => window.removeEventListener("resize", updateIndicator)
  }, [activeNav, mounted])

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
        <Link href="/" className="shrink-0 group mr-6 lg:mr-16 flex items-center h-full" onClick={() => setIsOpen(false)}>
          <LogoHeader />
        </Link>

        {/* DESKTOP NAV */}
        <div ref={navContainerRef} className="hidden lg:flex flex-1 items-center justify-center gap-2 xl:gap-3 relative">
          <span
            className="pointer-events-none absolute top-1/2 rounded-full bg-gradient-to-r from-[#FFE082] to-[#FFC107] shadow-[0_14px_30px_rgba(255,193,7,0.22)]"
            style={{
              transform: `translateX(${indicatorStyle.left}px) translateY(-50%)`,
              width: indicatorStyle.width,
              height: "48px",
              opacity: indicatorStyle.opacity,
              transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s ease, opacity 0.15s ease",
              willChange: "transform, width",
            }}
          />

          <nav className="flex items-center gap-2 xl:gap-3 z-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                data-nav-item={item.id}
                onClick={(e) => handleNavClick(e, item)}
                className={navItemClass(activeNav === item.id)}
              >
                {item.name}
              </Link>
            ))}

            <Link
              href={accountHref}
              data-nav-item="account"
              aria-label="My Account"
              className={`${navItemClass(isAccountPage)} md:flex`}
            >
              <User className="h-[24px] w-[24px]" />
              <span className="sr-only">My Account</span>
            </Link>

            <Link
              href="/cart"
              data-nav-item="cart"
              aria-label="Cart"
              className={navItemClass(isCartPage)}
            >
              <ShoppingBag className="h-[24px] w-[24px]" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-[#FFC107] text-[9px] font-extrabold text-black border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle menu"
                className="lg:hidden ml-1.5 size-11 rounded-full text-[#3d3427] hover:bg-amber-100/70 transition-all duration-250"
              >
                {isOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
              </Button>
            </SheetTrigger>

            {/* MOBILE DRAWER */}
            <SheetContent side="right" className="w-70 sm:w-[320px] p-0 border-l border-amber-100 bg-[#FFFDF8]">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">Primary site navigation menu.</SheetDescription>

              <div className="flex flex-col h-full">

                {/* Drawer header */}
                <div className="flex items-center px-5 h-16 border-b border-amber-50">
                  <Link href="/" onClick={() => setIsOpen(false)}>
                    <LogoMobile />
                  </Link>
                </div>

                {/* Nav items */}
                <nav className="flex flex-col gap-1.5 p-4 flex-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={(e) => handleNavClick(e as any, item)}
                      className={`flex items-center h-12 px-4 rounded-2xl text-base font-semibold transition-all duration-300 ease-in-out transform relative group ${
                        activeNav === item.id
                          ? "bg-gradient-to-r from-[#FDD835] via-[#FFC107] to-[#FFB300] text-[#6b3e00] shadow-[0_14px_30px_rgba(255,179,0,0.18)] -translate-y-0.5"
                          : "text-[#3d3427] hover:bg-amber-50/80 hover:text-[#D4900A] hover:shadow-[0_8px_24px_rgba(212,144,10,0.1)]"
                      }`}
                    >
                      {item.name}
                      {activeNav === item.id && (
                        <span className="absolute right-4 h-2 w-2 rounded-full bg-[#D4900A]" />
                      )}
                    </Link>
                  ))}
                </nav>

                {/* Drawer footer */}
                <div className="p-4 border-t border-amber-50 flex flex-col gap-1">
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
