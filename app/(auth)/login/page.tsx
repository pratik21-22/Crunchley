import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AuthForm } from "@/components/common/auth-form"

export const metadata: Metadata = {
  title: "Login - Crunchley",
  description: "Sign in to your Crunchley account",
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-[100svh] items-center justify-center bg-background px-4 py-16 sm:px-6 sm:py-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 rounded-full bg-primary/5 blur-3xl" style={{ width: 1000, height: 1000 }} />
        <div className="absolute -bottom-1/2 -left-1/2 rounded-full bg-primary/5 blur-3xl" style={{ width: 1000, height: 1000 }} />
      </div>

      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/90 px-3.5 py-2 text-sm font-semibold text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:border-amber-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 md:left-8 md:top-6 md:gap-2 md:px-4"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        Go to Home
      </Link>
      
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 pt-10 sm:pt-0">
        <AuthForm mode="login" />
      </div>
    </main>
  )
}
