"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 rounded-full bg-primary/5 blur-3xl" style={{ width: 1000, height: 1000 }} />
        <div className="absolute -bottom-1/2 -left-1/2 rounded-full bg-primary/5 blur-3xl" style={{ width: 1000, height: 1000 }} />
      </div>

      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/90 px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:border-amber-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 md:left-8 md:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Go to Home
      </Link>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="w-full border-0 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <Link href="/" className="mb-4 inline-block">
              <span className="font-serif text-3xl font-bold tracking-tight text-foreground">
                Crunchley
              </span>
            </Link>

            {!isSubmitted ? (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
                <CardDescription className="text-muted-foreground">
                  No worries, we&apos;ll send you reset instructions.
                </CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                <CardDescription className="text-muted-foreground">
                  We sent a password reset link to
                  <br />
                  <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </Field>
                </FieldGroup>

                <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </Button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </form>
            ) : (
              <div className="space-y-4">
                <Button
                  type="button"
                  className="w-full h-11 font-semibold"
                  onClick={() => window.open("https://mail.google.com", "_blank")}
                >
                  Open email app
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Didn&apos;t receive the email?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false)
                      setEmail("")
                    }}
                    className="font-semibold text-secondary hover:text-secondary/80 transition-colors"
                  >
                    Click to resend
                  </button>
                </p>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
