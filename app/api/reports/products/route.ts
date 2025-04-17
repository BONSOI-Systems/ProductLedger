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
    const { db } = await connectToDatabase()

    // Get product categories and their counts
    const categoryCounts = await db
      .collection(collections.products)
      .aggregate([
        { $match: { companyId } },
        { $group: { _id: "$category", value: { $sum: 1 } } },
        { $project: { _id: 0, name: "$_id", value: 1 } },
        { $sort: { value: -1 } },
        { $limit: 6 }, // Limit to top 6 categories
      ])
      .toArray()

    return NextResponse.json(categoryCounts)
  } catch (error) {
    console.error("Failed to fetch product report:", error)
    return NextResponse.json({ error: "Failed to fetch product report" }, { status: 500 })
  }
}