"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Circle, Loader2, PackageSearch, ShieldCheck, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { trackEvent } from "@/lib/analytics"

type TrackOrderResponse = {
  success: boolean
  error?: string
  data?: {
    id: string
    total: number
    paymentMethod: string
    paymentStatus: string
    fulfillmentStatus: string
    status: string
    itemsCount: number
    createdAt: string
    customer: {
      name: string
      email: string
      phone: string
      address: string
      pincode: string
    }
    timeline: Array<{
      step: "placed" | "confirmed" | "packed" | "shipped" | "delivered"
      completed: boolean
      at?: string | null
    }>
    accessMode: "admin" | "account-linked" | "guest-verified"
  }
}

const stepLabel: Record<string, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<TrackOrderResponse["data"] | null>(null)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" })
        if (!response.ok) {
          setHasSession(false)
          return
        }

        const payload = (await response.json()) as { success?: boolean; authenticated?: boolean }
        setHasSession(Boolean(payload.success && payload.authenticated))
      } catch {
        setHasSession(false)
      }
    })()
  }, [])

  const canSubmit = useMemo(() => {
    if (!orderId.trim()) return false
    return hasSession ? true : Boolean(email.trim() || phone.trim())
  }, [email, hasSession, orderId, phone])

  const handleTrack = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      })

      const payload = (await response.json()) as TrackOrderResponse

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Unable to track order")
      }

      setResult(payload.data)
      trackEvent("track_order", {
        access_mode: payload.data.accessMode,
        order_id: payload.data.id,
      })
    } catch (trackError: unknown) {
      setResult(null)
      setError(trackError instanceof Error ? trackError.message : "Unable to track order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FFFDF8] pt-20 pb-10">
      <div className="container mx-auto max-w-5xl px-5 md:px-8">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] md:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Track Order</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1c1917] md:text-4xl">Find your order status</h1>
              <p className="mt-3 max-w-2xl text-slate-500">
                {hasSession
                  ? "Use your Order ID to track account-linked orders instantly, or use email/mobile for guest orders."
                  : "Use your Order ID and either your email or mobile number to securely track your delivery progress."}
              </p>
            </div>
            <div className="hidden rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:block">
              <ShieldCheck className="mr-1 inline h-4 w-4" />
              Secure lookup
            </div>
          </div>

          <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleTrack}>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                placeholder="e.g. 69dce208d6a3e216bf30561d"
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            {error && <p className="md:col-span-2 text-sm font-medium text-red-600">{error}</p>}

            <div className="md:col-span-2">
              <Button type="submit" disabled={!canSubmit || loading} className="h-11 rounded-xl px-6">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageSearch className="h-4 w-4" />}
                {loading ? "Tracking..." : "Track Order"}
              </Button>
            </div>
          </form>

          {result && (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              <Card className="border-0 shadow-sm ring-1 ring-slate-100">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between"><span className="text-slate-500">Order ID</span><span className="font-semibold text-slate-900">{result.id}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Items</span><span className="font-semibold text-slate-900">{result.itemsCount}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Amount</span><span className="font-semibold text-slate-900">₹{result.total.toFixed(2)}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Payment</span><span className="font-semibold text-slate-900">{result.paymentStatus}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Fulfillment</span><span className="font-semibold text-slate-900">{result.fulfillmentStatus}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Placed On</span><span className="font-semibold text-slate-900">{new Date(result.createdAt).toLocaleString()}</span></div>

                  {result.accessMode === "account-linked" && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                      This order is linked to your account.
                    </div>
                  )}

                  <div className="pt-2">
                    <Link href="/my-orders" className="text-xs font-semibold text-amber-700 hover:text-amber-800">
                      View all my orders
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm ring-1 ring-slate-100">
                <CardHeader>
                  <CardTitle>Delivery Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.timeline.map((step) => (
                    <div key={step.step} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3">
                      {step.completed ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 text-slate-300" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{stepLabel[step.step]}</p>
                        <p className="text-xs text-slate-500">
                          {step.at ? new Date(step.at).toLocaleString() : step.completed ? "Completed" : "Pending"}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <Truck className="mr-1 inline h-4 w-4" />
                    You will receive shipping updates as your order progresses.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
