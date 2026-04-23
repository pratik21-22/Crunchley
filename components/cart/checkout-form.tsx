"use client"

import { useEffect, useState } from "react"
import { CreditCard, Landmark, Smartphone, Wallet, Shield, Truck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void
  onFormChange?: (data: CheckoutFormData) => void
  isLoading?: boolean
  allowCod?: boolean
  initialData?: Partial<CheckoutFormData>
}

export interface CheckoutFormData {
  name: string
  email: string
  phone: string
  address: string
  pincode: string
  paymentMethod: string
}

const onlinePaymentMethods = [
  {
    id: "upi",
    name: "UPI",
    description: "Instant payment via UPI apps",
    icon: Zap,
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, RuPay",
    icon: CreditCard,
  },
  {
    id: "netbanking",
    name: "Net Banking",
    description: "All major banks supported",
    icon: Landmark,
  },
]

const codPaymentMethod = {
  id: "cod",
  name: "Pay on Delivery",
  description: "Cash / UPI accepted at delivery",
  icon: Wallet,
}

export function CheckoutForm({ onSubmit, onFormChange, isLoading, allowCod = false, initialData }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
    paymentMethod: "upi",
  })

  useEffect(() => {
    if (!initialData) return

    setFormData((prev) => ({
      ...prev,
      name: prev.name || initialData.name || "",
      email: prev.email || initialData.email || "",
      phone: prev.phone || initialData.phone || "",
      address: prev.address || initialData.address || "",
      pincode: prev.pincode || initialData.pincode || "",
      paymentMethod: prev.paymentMethod || initialData.paymentMethod || "upi",
    }))
  }, [initialData])

  useEffect(() => {
    onFormChange?.(formData)
  }, [formData, onFormChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Shipping Address */}
      <Card className="border-0 bg-card shadow-sm">
        <CardContent className="p-6">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Shipping Address
          </h2>

          <FieldGroup className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg"
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="address">Street Address</FieldLabel>
              <Input
                id="address"
                name="address"
                placeholder="House/Flat, Street, Area"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="rounded-lg"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="pincode">PIN Code</FieldLabel>
                <Input
                  id="pincode"
                  name="pincode"
                  placeholder="400001"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg"
                />
              </Field>

              <div className="rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                Guest checkout is enabled. You can place your order now and create an account later to track everything in one place.
              </div>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="border-0 bg-card shadow-sm">
        <CardContent className="p-6">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Payment Method
          </h2>

          <RadioGroup
            value={formData.paymentMethod}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, paymentMethod: value }))
            }
            className="mt-6 flex flex-col gap-4"
          >
            {/* Online Payment Section */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Online Payment</p>
              <div className="space-y-3">
                {onlinePaymentMethods.map((method) => (
                  <Label
                    key={method.id}
                    htmlFor={method.id}
                    className="flex cursor-pointer items-center gap-4 rounded-xl border bg-background p-4 transition-all hover:border-amber-300 has-checked:border-[#F5A623] has-checked:bg-amber-50"
                  >
                    <RadioGroupItem value={method.id} id={method.id} />
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <method.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </Label>
                ))}
              </div>
            </div>

            {/* Cash on Delivery Section */}
            {allowCod && (
              <>
                <Separator className="my-2" />
                <div>
                  <Label
                    htmlFor="cod"
                    className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 transition-all hover:border-emerald-300 has-checked:border-emerald-500 has-checked:bg-emerald-100"
                  >
                    <RadioGroupItem value="cod" id="cod" />
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                      <Truck className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-emerald-900">{codPaymentMethod.name}</p>
                      <p className="text-sm text-emerald-700">{codPaymentMethod.description}</p>
                    </div>
                  </Label>
                  <div className="mt-3 flex flex-col gap-2 rounded-lg bg-emerald-50 p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="text-emerald-700">Pay securely by cash or UPI when order arrives</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </RadioGroup>

          {(formData.paymentMethod === "card" || formData.paymentMethod === "upi") && (
            <>
              <Separator className="my-6" />
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
                <p className="font-semibold">🔒 Secure Payment</p>
                <p>Your payment details are encrypted and secure. Handled by Razorpay.</p>
              </div>
            </>
          )}

          {formData.paymentMethod === "cod" && allowCod && (
            <>
              <Separator className="my-6" />
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <p className="font-semibold">✓ COD Instructions</p>
                <ul className="mt-2 list-inside space-y-1 text-xs">
                  <li>• Keep exact cash amount ready for delivery</li>
                  <li>• Our delivery partner will contact you before arrival</li>
                  <li>• No payment data shared online</li>
                  <li>• You can verify the order before paying</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Submit Button - Desktop */}
      <div className="hidden md:block">
        <Button
          type="submit"
          size="lg"
          className="w-full rounded-full text-base"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Proceed to Payment"}
        </Button>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          By placing this order, you agree to our Terms of Service and Privacy
          Policy.
        </p>
      </div>
    </form>
  )
}
