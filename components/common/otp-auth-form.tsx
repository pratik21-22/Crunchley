"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Phone, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { LogoAuth } from "@/components/common/logo"
import { trackEvent } from "@/lib/analytics"
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth"
import { auth } from "@/lib/firebase"

interface OTPAuthFormProps {
  onSwitchToEmail: () => void
}

export function OTPAuthForm({ onSwitchToEmail }: OTPAuthFormProps) {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")

  const redirectTo =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("next") || "/profile"
      : "/profile"

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          toast.error("reCAPTCHA expired. Please try again.")
        },
      })
    }
  }

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "")
    // Add +91 prefix if not present
    return cleaned.startsWith("91") ? `+${cleaned}` : `+91${cleaned}`
  }

  const sendOTP = async () => {
    if (!phoneNumber.trim()) {
      setErrorMessage("Please enter a valid phone number")
      return
    }

    const formattedPhone = formatPhoneNumber(phoneNumber)
    if (formattedPhone.length !== 13) { // +91 + 10 digits
      setErrorMessage("Please enter a valid 10-digit phone number")
      return
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      setupRecaptcha()
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier)
      setConfirmationResult(confirmation)
      setOtpSent(true)
      setResendTimer(60) // 60 seconds cooldown
      toast.success("OTP sent to your phone number")
    } catch (error: any) {
      console.error("Error sending OTP:", error)
      let message = "Failed to send OTP. Please try again."

      if (error.code === "auth/invalid-phone-number") {
        message = "Invalid phone number format"
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many requests. Please try again later."
      } else if (error.code === "auth/missing-recaptcha-token") {
        message = "reCAPTCHA verification failed"
      }

      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit OTP")
      return
    }

    if (!confirmationResult) {
      setErrorMessage("Please request OTP first")
      return
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      const result = await confirmationResult.confirm(otp)
      const user = result.user

      // Send user data to our backend
      const response = await fetch("/api/auth/otp-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          displayName: user.displayName,
          email: user.email,
        }),
      })

      const json = await response.json()
      if (!response.ok || !json?.success) {
        throw new Error(typeof json?.error === "string" ? json.error : "Verification failed")
      }

      toast.success("Phone number verified successfully")
      trackEvent("login", {
        method: "phone_otp",
        user_role: json?.data?.role || "user",
      })

      const destination = json?.data?.role === "admin" ? "/admin/dashboard" : redirectTo
      await router.push(destination)
      router.refresh()
    } catch (error: any) {
      console.error("Error verifying OTP:", error)
      let message = "Invalid OTP. Please try again."

      if (error.code === "auth/invalid-verification-code") {
        message = "Invalid OTP code"
      } else if (error.code === "auth/code-expired") {
        message = "OTP has expired. Please request a new one."
      }

      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const resendOTP = () => {
    if (resendTimer > 0) return
    setOtp("")
    sendOTP()
  }

  return (
    <>
      <Card className="w-full max-w-md border border-slate-200/80 bg-white/95 shadow-[0_16px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <LogoAuth />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {otpSent ? "Enter OTP" : "Phone Login"}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {otpSent
              ? `We've sent a 6-digit code to ${formatPhoneNumber(phoneNumber)}`
              : "Enter your phone number to receive an OTP"
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!otpSent ? (
            <>
              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <FieldGroup>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter 10-digit number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </FieldGroup>
              </Field>

              <Button
                onClick={sendOTP}
                disabled={isLoading || !phoneNumber.trim()}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </>
          ) : (
            <>
              <Field>
                <FieldLabel htmlFor="otp">Enter 6-digit OTP</FieldLabel>
                <FieldGroup>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="text-center text-lg tracking-widest"
                    disabled={isLoading}
                    maxLength={6}
                  />
                </FieldGroup>
              </Field>

              <div className="flex gap-2">
                <Button
                  onClick={verifyOTP}
                  disabled={isLoading || otp.length !== 6}
                  className="flex-1"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={resendOTP}
                  disabled={isLoading || resendTimer > 0}
                  size="lg"
                >
                  {resendTimer > 0 ? (
                    `${resendTimer}s`
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          )}

          {errorMessage && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          <div className="text-center">
            <Button
              variant="link"
              onClick={onSwitchToEmail}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Use email instead
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </>
  )
}