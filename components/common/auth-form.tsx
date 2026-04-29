"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { LogoAuth } from "@/components/common/logo"
import { trackEvent } from "@/lib/analytics"

interface AuthFormProps {
  mode: "login" | "signup"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  })

  const isLogin = mode === "login"
  const redirectTo =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("next") || "/profile"
      : "/profile"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup"
      const payload = isLogin
        ? {
            identifier: formData.email.trim(),
            password: formData.password,
            rememberMe: formData.rememberMe,
          }
        : {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            password: formData.password,
          }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(typeof json?.error === "string" ? json.error : "Authentication failed")
      }

      toast.success(isLogin ? "Logged in successfully" : "Account created successfully")
      trackEvent(isLogin ? "login" : "sign_up", {
        method: "email",
        user_role: json?.data?.role || "user",
      })
      const destination = isLogin && json?.data?.role === "admin" ? "/admin/dashboard" : redirectTo
      await router.push(destination)
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Authentication failed"
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    toast.info("Google sign-in is not configured yet")
  }

  return (
    <Card className="w-full max-w-md border border-slate-200/80 bg-white/95 shadow-[0_16px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <CardHeader className="space-y-1 px-5 pt-6 pb-4 text-center sm:px-8 sm:pt-8 sm:pb-5">
        <div className="mb-3 flex justify-center sm:mb-4">
          <LogoAuth />
        </div>
        <CardTitle className="text-[1.6rem] font-bold tracking-tight sm:text-2xl">
          {isLogin ? "Welcome back" : "Create an account"}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground sm:text-[15px]">
          {isLogin
            ? "Enter your credentials to access your account"
            : "Enter your details to get started"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-6 pt-0 sm:px-8 sm:pb-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-3 border-slate-200 bg-white/85 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 active:translate-y-0 active:scale-[0.99]"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <FieldSeparator>or</FieldSeparator>

          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          <FieldGroup className="gap-4 sm:gap-5">
            {/* Name Field (Signup only) */}
            {!isLogin && (
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isLoading}
                  className="h-11 border-slate-200 bg-slate-50/80 text-[15px] shadow-sm transition-all placeholder:text-slate-400 focus-visible:border-amber-300 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-amber-400/20"
                />
              </Field>
            )}

            {!isLogin && (
              <Field>
                <FieldLabel htmlFor="phone">Mobile Number (Optional)</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isLoading}
                  className="h-11 border-slate-200 bg-slate-50/80 text-[15px] shadow-sm transition-all placeholder:text-slate-400 focus-visible:border-amber-300 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-amber-400/20"
                />
              </Field>
            )}

            {/* Email Field */}
            <Field>
              <FieldLabel htmlFor="email">{isLogin ? "Email or Mobile" : "Email"}</FieldLabel>
              <Input
                id="email"
                type="text"
                placeholder={isLogin ? "name@example.com or +91 98765 43210" : "name@example.com"}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                className="h-11 border-slate-200 bg-slate-50/80 text-[15px] shadow-sm transition-all placeholder:text-slate-400 focus-visible:border-amber-300 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-amber-400/20"
              />
            </Field>

            {/* Password Field */}
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                {isLogin && (
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-amber-700 transition-colors hover:text-amber-800"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "Enter your password" : "Create a password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                  className="h-11 border-slate-200 bg-slate-50/80 pr-10 text-[15px] shadow-sm transition-all placeholder:text-slate-400 focus-visible:border-amber-300 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-amber-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground active:scale-95"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>

            {/* Confirm Password (Signup only) */}
            {!isLogin && (
              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    disabled={isLoading}
                    className="h-11 border-slate-200 bg-slate-50/80 pr-10 text-[15px] shadow-sm transition-all placeholder:text-slate-400 focus-visible:border-amber-300 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-amber-400/20"
                  />
                </div>
              </Field>
            )}

            {/* Remember Me (Login only) */}
            {isLogin && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, rememberMe: checked as boolean })
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Remember me for 30 days
                </label>
              </div>
            )}

            {/* Terms (Signup only) */}
            {!isLogin && (
              <p className="text-sm text-muted-foreground">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4">
                  Privacy Policy
                </Link>
              </p>
            )}
          </FieldGroup>

          {/* Submit Button */}
          <Button
            type="submit"
            className="h-11 w-full font-semibold transition-all hover:-translate-y-0.5 hover:bg-amber-500 active:translate-y-0 active:scale-[0.99]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isLogin ? "Signing in..." : "Creating account..."}
              </>
            ) : isLogin ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </Button>

          {/* Switch Mode Link */}
          <p className="pt-1 text-center text-sm leading-6 text-muted-foreground sm:pt-2">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link
              href={isLogin ? "/signup" : "/login"}
              className="font-semibold text-secondary transition-colors hover:text-secondary/80"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
