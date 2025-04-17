import { NextResponse } from "next/server"
import { connectToDatabase, collections } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const companyId = session.user.id

    try {
      const { db } = await connectToDatabase()

      // Get overdue settings
      const settings = (await db.collection(collections.overdueSettings).findOne({ companyId })) || {
        gracePeriod: 7,
        interestRate: 0.15, // 15% annual interest rate
        compoundingPeriod: "daily",
        minimumFee: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      return NextResponse.json(settings)
    } catch (error) {
      console.error("Database error:", error)

      // Return default settings if database connection fails
      return NextResponse.json({
        gracePeriod: 7,
        interestRate: 0.15,
        compoundingPeriod: "daily",
        minimumFee: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  } catch (error) {
    console.error("Failed to fetch overdue settings:", error)
    return NextResponse.json({ error: "Failed to fetch overdue settings" }, { status: 500 })
  }
}