import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import BusinessEnquiry from "@/lib/models/business-enquiry"

type BusinessEnquiryBody = {
  name?: string
  company?: string
  email?: string
  phone?: string
  type?: string
  quantity?: string
  message?: string
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const body = (await req.json()) as BusinessEnquiryBody
    const name = body.name?.trim()
    const company = body.company?.trim()
    const email = body.email?.trim().toLowerCase()
    const phone = body.phone?.trim()
    const type = body.type?.trim()
    const quantity = body.quantity?.trim()
    const message = body.message?.trim()

    if (!name || !email || !phone || !type) {
      return NextResponse.json({ success: false, error: "Name, email, phone and enquiry type are required" }, { status: 400 })
    }

    if (!["bulk", "retail", "gifting", "export", "other"].includes(type)) {
      return NextResponse.json({ success: false, error: "Invalid enquiry type" }, { status: 400 })
    }

    const enquiry = await BusinessEnquiry.create({
      name,
      company,
      email,
      phone,
      type,
      quantity,
      message,
      status: "new",
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: String(enquiry._id),
          name: enquiry.name,
          company: enquiry.company,
          email: enquiry.email,
          phone: enquiry.phone,
          type: enquiry.type,
          quantity: enquiry.quantity,
          message: enquiry.message,
          status: enquiry.status,
          createdAt: enquiry.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit enquiry"
    console.error("Business enquiry create error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
