import mongoose, { Document, Model, Schema } from "mongoose"

export type BusinessEnquiryType = "bulk" | "retail" | "gifting" | "export" | "other"
export type BusinessEnquiryStatus = "new" | "contacted" | "qualified" | "closed"

export interface IBusinessEnquiry extends Document {
  name: string
  company?: string
  email: string
  phone: string
  type: BusinessEnquiryType
  quantity?: string
  message?: string
  status: BusinessEnquiryStatus
  createdAt: Date
  updatedAt: Date
}

const BusinessEnquirySchema = new Schema<IBusinessEnquiry>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    company: { type: String, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["bulk", "retail", "gifting", "export", "other"],
      default: "bulk",
      index: true,
    },
    quantity: { type: String, trim: true },
    message: { type: String, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "closed"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true }
)

const BusinessEnquiry: Model<IBusinessEnquiry> =
  mongoose.models?.BusinessEnquiry || mongoose.model<IBusinessEnquiry>("BusinessEnquiry", BusinessEnquirySchema)

export default BusinessEnquiry
