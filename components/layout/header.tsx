"use client"

import { useEffect, useState } from "react"
import { useCartStore } from "@/store/cart"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ShoppingCart, User, X } from "lucide-react"
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
  const pathname = usePathname() || "/"
  const [isOpen, setIsOpen] = useState(false)
  const [accountHref, setAccountHref] = useState("/login")
  const [mounted, setMounted] = useState(false)
  const cartCount = useCartStore((s) => s.getCartCount())
  const [scrolled, setScrolled] = useState(false)

  // active section for homepage only
  const [activeSection, setActiveSection] = useState<string>("home")

  useEffect(() => setMounted(true), [])

  // resolve account route
  useEffect(() => {
    let cancelled = false
    const resolveAccountRoute = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" })
        if (!response.ok) {
          if (!cancelled) setAccountHref("/login")
          return
        }
        const payload = await response.json()
        if (cancelled) return
        if (!payload?.success || !payload?.authenticated || !payload?.data) {
          setAccountHref("/login")
          return
        }
        setAccountHref(payload.data.role === "admin" ? "/admin" : "/profile")
      } catch (e) {
        if (!cancelled) setAccountHref("/login")
      }
    }
    resolveAccountRoute()
    return () => {
      cancelled = true
    }
  }, [])

  // scrolled background toggle
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Active nav resolution
  const isAccountPage = pathname.startsWith("/profile") || pathname.startsWith("/account") || pathname.startsWith("/my-orders") || pathname.startsWith("/access-denied")
  const isCartPage = pathname.startsWith("/cart")

  const activeNav = (() => {
    if (pathname === "/") return activeSection || "home"
    if (pathname.startsWith("/products")) return "shop"
    if (isCartPage) return "cart"
    if (isAccountPage) return "enquiry"
    return ""
  })()

  // Improved scroll detection (rAF, header-aware, handles load/resize/hashchange)
  useEffect(() => {
    if (typeof window === "undefined") return

    if (pathname !== "/") {
      setActiveSection("")
      return
    }

    const SECTION_IDS = ["business-enquiry", "flavours", "bestsellers"] // bottom-to-top order

    let ticking = false

    const getHeaderHeight = () => {
      const el = document.querySelector("header") as HTMLElement | null
      return (el?.offsetHeight ?? 72) + 8 // small buffer
    }

    const checkSections = () => {
      const headerH = getHeaderHeight()
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= headerH) {
          if (id === "business-enquiry") setActiveSection("enquiry")
          else setActiveSection(id)
          return
        }
      }
      setActiveSection("home")
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          checkSections()
          ticking = false
        })
      }
    }

    // initial checks: on load, slight delay for images/layout shift
    checkSections()
    const initTimeout = window.setTimeout(checkSections, 200)

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", checkSections)
    window.addEventListener("hashchange", () => setTimeout(checkSections, 50))

    return () => {
      window.clearTimeout(initTimeout)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", checkSections)
      window.removeEventListener("hashchange", () => setTimeout(checkSections, 50))
    }
  }, [pathname])

  // Nav item styling
  const navItemBaseClass = "relative inline-flex items-center h-12 px-4 rounded-full text-[15px] font-semibold tracking-[0.01em] transition-all duration-300 whitespace-nowrap z-10 transform"
  const navItemClass = (isActive: boolean) =>
    `${navItemBaseClass} ${
      isActive
        ? "bg-yellow-400 text-black shadow-md font-semibold scale-110 text-[16px]"
        : "text-[#3d3427] hover:bg-yellow-100 hover:text-black hover:shadow-[0_8px_20px_rgba(212,144,10,0.08)] hover:scale-[1.03]"
    }`

  const iconClass = (isActive: boolean) =>
    `inline-flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300 z-10 transform ${
      isActive
        ? "bg-yellow-400 text-black shadow-md scale-110"
        : "text-[#3d3427] hover:bg-yellow-100 hover:text-black hover:shadow-[0_8px_20px_rgba(212,144,10,0.08)] hover:scale-[1.03]"
    }`

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#FFFDF8]/92 backdrop-blur-3xl border-b border-amber-100/80 shadow-[0_12px_32px_rgba(17,24,39,0.1)]"
          : "bg-[#FFFDF8]/84 backdrop-blur-xl border-b border-amber-50/70"
      }`}
    >
      <div className="h-17 w-full max-w-350 mx-auto">
        <div className="flex items-center justify-between w-full px-4 md:hidden">
          <Link href="/" className="shrink-0 flex items-center h-full" onClick={() => setIsOpen(false)}>
            <LogoHeader />
          </Link>

          <div className="flex items-center gap-3">
            <Link 
              href="/cart" 
              aria-label="Shopping Cart" 
              className="relative inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-amber-100/70 transition-all text-black hover:text-black"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingCart className="w-6 h-6" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="shrink-0">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Toggle menu" className="size-11 rounded-full text-[#3d3427] hover:bg-amber-100/70 transition-all active:scale-95">
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
                              ? "bg-yellow-400 text-black shadow-md font-semibold scale-110"
                              : "text-[#3d3427] hover:bg-yellow-100 hover:text-black hover:shadow-[0_8px_20px_rgba(212,144,10,0.08)]"
                          }`}
                        >
                          {item.label}
                          {activeNav === item.id && <span className="absolute right-4 h-2 w-2 rounded-full bg-[#D4900A]" />}
                        </Link>
                      ))}
                    </nav>

                    {/* Drawer footer */}
                    <div className="p-4 border-t border-amber-50 space-y-1.5">
                      <Link href={accountHref} onClick={() => setIsOpen(false)} className="flex items-center gap-3 h-12 px-4 rounded-xl text-base font-semibold text-[#3d3427] hover:bg-amber-50/70 hover:text-[#D4900A] transition-all active:scale-95">
                        <User className="h-4 w-4" />
                        My Account
                      </Link>
                      <p className="text-center text-[11px] text-amber-600/60 font-medium tracking-widest uppercase mt-3">Healthy Snacking Made Easy</p>
                    </div>

                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="hidden md:flex h-full items-center px-4 sm:px-5 lg:px-12">
          {/* LOGO */}
          <Link href="/" className="shrink-0 flex items-center h-full" onClick={() => setIsOpen(false)}>
            <LogoHeader />
          </Link>

          {/* DESKTOP NAV - CENTER */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-2 xl:gap-3">
            {navigation.map((item) => (
              <Link key={item.id} href={item.href} onClick={() => setIsOpen(false)} className={navItemClass(activeNav === item.id)}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ICONS - RIGHT ZONE */}
          <div className="hidden lg:flex items-center gap-2 ml-8 shrink-0">
            <Link href={accountHref} aria-label="My Account" className={iconClass(isAccountPage)} onClick={() => setIsOpen(false)}>
              <User className="h-5 w-5" />
            </Link>

            <Link href="/cart" aria-label="Shopping Cart" className={iconClass(isCartPage)} onClick={() => setIsOpen(false)}>
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
