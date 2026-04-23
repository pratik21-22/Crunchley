"use client"

import { useEffect } from "react"
import { trackEvent } from "@/lib/analytics"

type OrderSuccessAnalyticsProps = {
  orderId: string
  total: number
  itemsCount: number
  paymentMethod: string
  paymentStatus: string
}

export function OrderSuccessAnalytics({
  orderId,
  total,
  itemsCount,
  paymentMethod,
  paymentStatus,
}: OrderSuccessAnalyticsProps) {
  useEffect(() => {
    trackEvent("purchase", {
      transaction_id: orderId,
      value: total,
      currency: "INR",
      items_count: itemsCount,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
    })
  }, [itemsCount, orderId, paymentMethod, paymentStatus, total])

  return null
}
