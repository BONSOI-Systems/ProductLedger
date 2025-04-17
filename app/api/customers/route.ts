import { NextResponse } from "next/server"
import { connectToDatabase, collections } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session: { user?: { id?: string } } | null = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const companyId = session.user.id
    const { db } = await connectToDatabase()

    const customers = await db.collection(collections.customers).find({ companyId }).sort({ name: 1 }).toArray()

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Failed to fetch customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session: { user?: { id?: string } } | null = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const companyId = session.user.id
    const { db } = await connectToDatabase()
    const data = await request.json()

    // Add timestamps and company ID
    const customer = {
      ...data,
      companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection(collections.customers).insertOne(customer)

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      customer: { ...customer, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Failed to create customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
