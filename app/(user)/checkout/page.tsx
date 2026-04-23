"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { CheckoutForm, type CheckoutFormData } from "@/components/cart/checkout-form"
import { CheckoutSummary } from "@/components/cart/checkout-summary"
import { Button } from "@/components/ui/button"
import { useSiteSettings } from "@/hooks/use-site-settings"
import { useCartStore } from "@/store/cart"
import { trackEvent } from "@/lib/analytics"
import type {
  CreateOrderRequest,
  CreatePaymentOrderResponse,
  VerifyPaymentRequest,
} from "@/types"

type RazorpayCheckoutInstance = {
  open: () => void
  on: (event: "payment.failed", handler: (response: { error?: { description?: string } }) => void) => void
}

type RazorpayCheckoutConstructor = new (options: Record<string, unknown>) => RazorpayCheckoutInstance

type RazorpaySuccessPayload = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false)

  const maybeRazorpay = (window as Window & { Razorpay?: RazorpayCheckoutConstructor }).Razorpay
  if (maybeRazorpay) return Promise.resolve(true)

  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  const router = useRouter()
  const { settings } = useSiteSettings()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [initialFormData, setInitialFormData] = useState<Partial<CheckoutFormData>>({})
  const [checkoutData, setCheckoutData] = useState<CheckoutFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
    paymentMethod: "upi",
  })

  const cartItems = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const checkoutTrackedRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let active = true

    const loadPrefill = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session", { cache: "no-store" })
        if (!sessionRes.ok) return

        const sessionJson = (await sessionRes.json()) as {
          success?: boolean
          authenticated?: boolean
          data?: { name?: string; email?: string }
        }
        if (!active || !sessionJson?.success || !sessionJson?.authenticated || !sessionJson?.data) return

        const basePrefill: Partial<CheckoutFormData> = {
          name: typeof sessionJson.data.name === "string" ? sessionJson.data.name : "",
          email: typeof sessionJson.data.email === "string" ? sessionJson.data.email : "",
        }

        try {
          const ordersRes = await fetch("/api/orders?page=1&pageSize=1", { cache: "no-store" })
          if (ordersRes.ok) {
            const ordersJson = await ordersRes.json()
            const latest = Array.isArray(ordersJson?.data) ? ordersJson.data[0] : undefined
            const customer = latest?.customer

            if (customer && typeof customer === "object") {
              basePrefill.phone = typeof customer.phone === "string" ? customer.phone : ""
              basePrefill.address = typeof customer.address === "string" ? customer.address : ""
              basePrefill.pincode = typeof customer.pincode === "string" ? customer.pincode : ""
            }
          }
        } catch {
          // Keep basic name/email prefill if recent-order lookup fails.
        }

        if (active) {
          setInitialFormData(basePrefill)
        }
      } catch {
        // Guest mode or network issues should not block checkout rendering.
      }
    }

    void loadPrefill()

    return () => {
      active = false
    }
  }, [])

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0)
  const discount = cartItems.reduce(
    (sum, item) => sum + ((item.originalPrice || item.price) - item.price) * item.quantity,
    0
  )
  const shipping = subtotal - discount >= 499 || cartItems.length === 0 ? 0 : 49
  const total = subtotal - discount + shipping

  const canPlaceOrder = useMemo(() => {
    return Boolean(
      checkoutData.name.trim() &&
        checkoutData.email.trim() &&
        checkoutData.phone.trim() &&
        checkoutData.address.trim() &&
        checkoutData.pincode.trim() &&
        cartItems.length > 0
    )
  }, [checkoutData, cartItems.length])

  const hasItems = cartItems.length > 0

  useEffect(() => {
    if (!mounted || !hasItems || checkoutTrackedRef.current) {
      return
    }

    checkoutTrackedRef.current = true
    trackEvent("begin_checkout", {
      currency: "INR",
      value: total,
      items_count: cartItems.length,
      shipping: shipping,
      payment_method: checkoutData.paymentMethod,
    })
  }, [cartItems.length, checkoutData.paymentMethod, hasItems, mounted, shipping, total])

  const markOrderFailed = async (
    orderId: string,
    failureReason: string,
    paymentMethod?: string,
    guestToken?: string
  ) => {
    const payload: VerifyPaymentRequest = {
      orderId,
      paymentMethod: paymentMethod || checkoutData.paymentMethod,
      failureReason,
      guestAccessToken: guestToken,
    }
    await fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  }

  const openRazorpayCheckout = async ({
    appOrderId,
    paymentOrder,
    data,
    token,
  }: {
    appOrderId: string
    paymentOrder: CreatePaymentOrderResponse
    data: CheckoutFormData
    token?: string
  }): Promise<{ success: boolean; message?: string }> => {
    const loaded = await loadRazorpayScript()
    if (!loaded) {
      await markOrderFailed(appOrderId, "Unable to load payment gateway", data.paymentMethod, token)
      return { success: false, message: "Unable to load payment gateway" }
    }

    const RazorpayCtor = (window as Window & { Razorpay?: RazorpayCheckoutConstructor }).Razorpay
    if (!RazorpayCtor) {
      await markOrderFailed(appOrderId, "Payment gateway unavailable", data.paymentMethod, token)
      return { success: false, message: "Payment gateway unavailable" }
    }

    return new Promise((resolve) => {
      let settled = false

      const finish = (result: { success: boolean; message?: string }) => {
        if (settled) return
        settled = true
        resolve(result)
      }

      const options: Record<string, unknown> = {
        key: paymentOrder.razorpayKeyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "Crunchley",
        description: "Complete your Crunchley order",
        order_id: paymentOrder.razorpayOrderId,
        prefill: {
          name: data.name,
          email: data.email,
          contact: data.phone,
        },
        notes: {
          appOrderId,
        },
        theme: {
          color: "#F5A623",
        },
        modal: {
          ondismiss: async () => {
            await markOrderFailed(appOrderId, "Payment popup dismissed", data.paymentMethod, token)
            finish({ success: false, message: "Payment was cancelled" })
          },
        },
        handler: async (response: RazorpaySuccessPayload) => {
          const verifyPayload: VerifyPaymentRequest = {
            orderId: appOrderId,
            paymentMethod: data.paymentMethod,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            guestAccessToken: token,
          }

          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(verifyPayload),
            })
            const verifyJson = await verifyRes.json()

            if (!verifyRes.ok || !verifyJson?.success) {
              finish({ success: false, message: verifyJson?.error || "Payment verification failed" })
              return
            }

            finish({ success: true })
          } catch {
            finish({ success: false, message: "Payment verification failed" })
          }
        },
      }

      const razorpay = new RazorpayCtor(options)

      razorpay.on("payment.failed", async (response: unknown) => {
        const message =
          typeof response === "object" &&
          response !== null &&
          "error" in response &&
          typeof (response as { error?: { description?: string } }).error?.description === "string"
            ? (response as { error?: { description?: string } }).error?.description || "Payment failed"
            : "Payment failed"
        await markOrderFailed(appOrderId, message, data.paymentMethod, token)
        finish({ success: false, message })
      })

      razorpay.open()
    })
  }

  const handleSubmit = async (data: CheckoutFormData) => {
    if (isLoading || cartItems.length === 0) return

    setCheckoutData(data)
    setIsLoading(true)

    const parts = data.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    const firstName = parts[0] || "Guest"
    const lastName = parts.slice(1).join(" ") || "Customer"

    const payload: CreateOrderRequest = {
      customer: {
        firstName,
        lastName,
        email: data.email.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        city: "N/A",
        state: "N/A",
        pincode: data.pincode.trim(),
      },
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        quantity: item.quantity,
        slug: item.slug,
        flavor: item.flavor,
      })),
      subtotal,
      discount,
      shipping,
      total,
      paymentMethod: data.paymentMethod,
    }

    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const orderJson = await orderRes.json()

      if (!orderRes.ok || !orderJson?.success || !orderJson?.data?.id) {
        throw new Error(orderJson?.error || "Unable to create order. Please try again.")
      }

      const appOrderId = String(orderJson.data.id)
      const token = typeof orderJson.data.guestAccessToken === "string" ? orderJson.data.guestAccessToken : ""

      if (data.paymentMethod === "cod") {
        clearCart()
        toast.success("Order placed successfully with Cash on Delivery")
        const codQuery = token
          ? `?orderId=${encodeURIComponent(appOrderId)}&guestToken=${encodeURIComponent(token)}`
          : `?orderId=${encodeURIComponent(appOrderId)}`
        router.push(`/order-success${codQuery}`)
        return
      }

      const paymentOrderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: appOrderId, guestAccessToken: token || undefined }),
      })

      const paymentOrderJson = await paymentOrderRes.json()

      if (!paymentOrderRes.ok || !paymentOrderJson?.success || !paymentOrderJson?.data) {
        await markOrderFailed(
          appOrderId,
          paymentOrderJson?.error || "Unable to initialize payment",
          data.paymentMethod,
          token
        )
        throw new Error(paymentOrderJson?.error || "Unable to initialize payment")
      }

      const paymentResult = await openRazorpayCheckout({
        appOrderId,
        paymentOrder: paymentOrderJson.data as CreatePaymentOrderResponse,
        data,
        token,
      })

      if (!paymentResult.success) {
        const message = paymentResult.message || "Payment failed"
        toast.error(message)
        router.push(
          `/order-failed?orderId=${encodeURIComponent(appOrderId)}&message=${encodeURIComponent(message)}`
        )
        return
      }

      clearCart()
      toast.success("Payment successful. Order confirmed!")
      const query = token
        ? `?orderId=${encodeURIComponent(appOrderId)}&guestToken=${encodeURIComponent(token)}`
        : `?orderId=${encodeURIComponent(appOrderId)}`
      router.push(`/order-success${query}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Order placement failed"
      toast.error(message)
      router.push(`/order-failed?message=${encodeURIComponent(message)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMobilePayNow = () => {
    void handleSubmit(checkoutData)
  }

  if (!mounted) return <div className="min-h-screen bg-background" />

  if (!hasItems) {
    return (
      <main className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto flex max-w-3xl flex-col items-center px-4 text-center md:px-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm md:p-10">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Checkout</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-4xl">Your cart is empty</h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Add a few Crunchley snacks to your cart before heading to checkout.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1c1917] px-6 text-sm font-bold text-white transition-all hover:bg-[#F5A623] hover:text-[#2c1c02]"
              >
                Browse Products
              </Link>
              <Link
                href="/cart"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:text-[#D4900A]"
              >
                Return to Cart
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <Link
          href="/cart"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>

        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Checkout
          </h1>
          <p className="text-muted-foreground">
            Complete your order by providing your shipping and payment details.
          </p>
        </div>

        {/* Secure Checkout Badge */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
          <ShieldCheck className="h-4 w-4" />
          Secure checkout • Data encrypted • COD available
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm
              onSubmit={handleSubmit}
              onFormChange={setCheckoutData}
              isLoading={isLoading}
              allowCod={settings.allowCod}
              initialData={initialFormData}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CheckoutSummary
                items={cartItems}
                subtotal={subtotal}
                discount={discount}
                shipping={shipping}
                total={total}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-card p-4 shadow-lg md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-xl font-bold text-foreground">₹{total}</p>
          </div>
          <Button
            onClick={handleMobilePayNow}
            disabled={isLoading || !canPlaceOrder}
            className="flex-1 rounded-full"
            size="lg"
          >
            {isLoading ? "Processing..." : "Pay Now"}
          </Button>
        </div>
      </div>

      {/* Spacer for mobile sticky footer */}
      <div className="h-24 md:hidden" />
    </main>
  )
}
