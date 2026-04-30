import mongoose, { Document, Model, Schema } from "mongoose"

export interface IOrderCustomer {
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

export interface IOrderItem {
  productId: string
  name: string
  price: number
  originalPrice?: number
  image: string
  quantity: number
  slug?: string
  flavor?: string
}

export interface IOrder extends Document {
  userId?: string
  userName?: string
  userEmail?: string
  customer: IOrderCustomer
  items: IOrderItem[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  fulfillmentStatus: "placed" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled"
  status: "placed" | "paid" | "failed" | "processing" | "completed" | "cancelled"
  paymentId?: string
  gatewayOrderId?: string
  paymentSignature?: string
  paymentError?: string
  paidAt?: Date
  failedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const OrderCustomerSchema = new Schema<IOrderCustomer>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    phoneNormalized: { type: String, trim: true, index: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    image: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    slug: { type: String, trim: true },
    flavor: { type: String, trim: true },
  },
  { _id: false }
)

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, trim: true, index: true, default: null },
    userName: { type: String, trim: true },
    userEmail: { type: String, trim: true, lowercase: true, index: true },
    customer: {
      type: OrderCustomerSchema,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "Order must include at least one item",
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    shipping: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, required: true, trim: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ["placed", "packed", "shipped", "delivered", "cancelled"],
      default: "placed",
      index: true,
    },
    paymentId: { type: String, trim: true },
    gatewayOrderId: { type: String, trim: true },
    paymentSignature: { type: String, trim: true },
    paymentError: { type: String, trim: true },
    paidAt: { type: Date },
    failedAt: { type: Date },
    status: {
      type: String,
      enum: ["placed", "paid", "failed", "processing", "completed", "cancelled"],
      default: "placed",
    },
  },
  {
    timestamps: true,
  }
)

const Order: Model<IOrder> =
  mongoose.models?.Order || mongoose.model<IOrder>("Order", OrderSchema)

export default Order
