import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth"
import BusinessEnquiry from "@/lib/models/business-enquiry"

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
    const session = await verifyAuthToken(token)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const enquiries = await BusinessEnquiry.find({}).sort({ createdAt: -1 }).lean()
    const counts = await BusinessEnquiry.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const statusCounts = counts.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item._id] = item.count
      return accumulator
    }, {})

    return NextResponse.json(
      {
        success: true,
        data: {
          summary: {
            total: enquiries.length,
            newCount: statusCounts.new || 0,
            contactedCount: statusCounts.contacted || 0,
            qualifiedCount: statusCounts.qualified || 0,
            closedCount: statusCounts.closed || 0,
          },
          enquiries: enquiries.map((enquiry) => ({
            id: String(enquiry._id),
            name: enquiry.name,
            company: enquiry.company || "-",
            email: enquiry.email,
            phone: enquiry.phone,
            type: enquiry.type,
            quantity: enquiry.quantity || "-",
            message: enquiry.message || "",
            status: enquiry.status,
            createdAt: enquiry.createdAt,
            updatedAt: enquiry.updatedAt,
          })),
        },
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load enquiries"
    console.error("Admin business enquiries error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
