export interface Product {
  id: string
  name: string
  slug: string
  price: number
  image: string
  category: string
  description: string
  stock: number
}

export interface User {
  id: string
  name: string
  email: string
  role?: "user" | "admin"
}

export interface OrderCustomer {
  firstName: string
  lastName: string
  email: string
  phone: string
  phoneNormalized?: string
  address: string
  city: string
  state: string
  pincode: string
}

export interface OrderItemInput {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  quantity: number
  slug?: string
  flavor?: string
}

export interface CreateOrderRequest {
  customer: OrderCustomer
  items: OrderItemInput[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  paymentMethod: string
}

export interface CreatePaymentOrderRequest {
  orderId: string
  guestAccessToken?: string
}

export interface CreatePaymentOrderResponse {
  orderId: string
  amount: number
  currency: string
  razorpayOrderId: string
  razorpayKeyId: string
}

export interface VerifyPaymentRequest {
  orderId: string
  guestAccessToken?: string
  paymentMethod?: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  failureReason?: string
}

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"
export type FulfillmentStatus = "placed" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled"

export interface OrderSummary {
  id: string
  userId?: string
  userName?: string
  userEmail?: string
  customer: OrderCustomer
  itemsCount: number
  total: number
  paymentMethod: string
  paymentId?: string
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  status: string
  createdAt: string
}

export interface OrderDetail {
  id: string
  userId?: string
  userName?: string
  userEmail?: string
  customer: OrderCustomer
  items: Array<{
    productId: string
    name: string
    price: number
    originalPrice?: number
    image: string
    quantity: number
    slug?: string
    flavor?: string
  }>
  subtotal: number
  discount: number
  shipping: number
  total: number
  paymentMethod: string
  paymentId?: string
  gatewayOrderId?: string
  paymentSignature?: string
  paymentError?: string
  paidAt?: string
  failedAt?: string
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  status: string
  createdAt: string
  updatedAt: string
}
