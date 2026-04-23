import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth"
import User from "@/lib/models/user"

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

    const users = await User.find({}).sort({ createdAt: -1 }).lean()
    const totals = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ])

    const roleCounts = totals.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item._id] = item.count
      return accumulator
    }, {})

    return NextResponse.json(
      {
        success: true,
        data: {
          summary: {
            total: users.length,
            admins: roleCounts.admin || 0,
            customers: roleCounts.user || 0,
          },
          users: users.map((user) => ({
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })),
        },
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load users"
    console.error("Admin users error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
