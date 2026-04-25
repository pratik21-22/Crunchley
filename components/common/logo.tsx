"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  className?: string
  containerClassName?: string
  textClassName?: string
  ariaLabel?: string
  onClick?: () => void
}

export function Logo({
  href,
  className,
  containerClassName,
  textClassName,
  ariaLabel = "Crunchley",
  onClick,
}: LogoProps) {
  const brandLead = "C"
  const brandTail = "runchley"

  const baseContainerClass =
    "inline-flex items-center justify-center rounded-full border border-[#E6C96A] bg-linear-to-b from-[#FFE45A] via-[#FFD52A] to-[#FFC400] px-4 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_20px_rgba(245,166,35,0.22)]"

  const baseTextClass =
    "text-[#151312] font-sans font-extrabold tracking-normal leading-none select-none antialiased [font-kerning:none] [font-variant-ligatures:none]"

  const content = (
    <span aria-label={ariaLabel} className={cn(baseContainerClass, containerClassName, className)}>
      <span className={cn(baseTextClass, "inline-flex items-baseline", textClassName)}>
        <span className="font-black">{brandLead}</span>
        <span>{brandTail}</span>
      </span>
    </span>
  )

  if (!href) {
    return content
  }

  return (
    <Link href={href} onClick={onClick} className="inline-flex group">
      {content}
    </Link>
  )
}

export function LogoHeader() {
  return (
    <Logo
      href={undefined}
      containerClassName="h-10 px-4.5"
      textClassName="text-[1.85rem]"
      className="group-hover:brightness-[1.03] transition-all duration-200"
    />
  )
}

export function LogoMobile() {
  return (
    <Logo
      href={undefined}
      containerClassName="h-10 px-4"
      textClassName="text-[1.5rem]"
      className="group-hover:brightness-[1.03] transition-all duration-200"
    />
  )
}

export function LogoFooter() {
  return (
    <Logo
      href="/"
      containerClassName="h-11 px-4.5"
      textClassName="text-[1.8rem]"
    />
  )
}

export function LogoAuth() {
  return (
    <Logo
      href="/"
      containerClassName="h-11 px-4.5 sm:h-12 sm:px-5"
      textClassName="text-[1.7rem] sm:text-[2rem]"
      className="group-hover:brightness-[1.03] transition-all duration-200"
    />
  )
}

export function LogoAdmin({
  className,
  containerClassName,
  textClassName,
}: {
  className?: string
  containerClassName?: string
  textClassName?: string
}) {
  return (
    <Logo
      href="/admin"
      containerClassName={cn("h-8 px-3.5", containerClassName)}
      textClassName={cn("text-[1.15rem] font-extrabold tracking-normal", textClassName)}
      className={className}
      ariaLabel="Crunchley Admin"
    />
  )
}
