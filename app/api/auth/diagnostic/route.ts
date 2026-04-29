import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import User from "@/lib/models/user"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    // Test database connection
    await connectToDatabase()

    // Check environment variables (without exposing secrets)
    const envCheck = {
      MONGO_URI: !!process.env.MONGO_URI,
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      AUTH_URL: !!process.env.AUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
    }

    // Check admin account
    const adminEmail = "admin@crunchley.com"
    const adminPassword = "Crunchley@Admin123"

    const admin = await User.findOne({ email: adminEmail })

    let adminCheck = {
      exists: !!admin,
      role: admin?.role,
      passwordHashExists: !!admin?.passwordHash,
      createdAt: admin?.createdAt,
    }

    // Test password verification
    let passwordTest = null
    if (admin?.passwordHash) {
      try {
        passwordTest = bcrypt.compareSync(adminPassword, admin.passwordHash)
      } catch (bcryptError) {
        passwordTest = `bcrypt error: ${bcryptError instanceof Error ? bcryptError.message : bcryptError}`
      }
    }

    // Test user lookup (simulate login query)
    const loginQuery = { email: adminEmail.toLowerCase() }
    const loginUser = await User.findOne(loginQuery)

    let loginSimulation = {
      userFound: !!loginUser,
      passwordValid: false,
      error: null as string | null,
    }

    if (loginUser && loginUser.passwordHash) {
      try {
        loginSimulation.passwordValid = bcrypt.compareSync(adminPassword, loginUser.passwordHash)
      } catch (error) {
        loginSimulation.error = error instanceof Error ? error.message : String(error)
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      adminAccount: adminCheck,
      passwordTest,
      loginSimulation,
      message: "Diagnostic completed successfully"
    })

  } catch (error) {
    console.error("Production diagnostic error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
