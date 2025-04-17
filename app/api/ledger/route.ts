import { NextResponse } from "next/server"
import { connectToDatabase, collections } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as { user?: { id?: string } } | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const companyId = session.user.id
    const { db } = await connectToDatabase()

    const ledgerEntries = await db.collection(collections.ledger).find({ companyId }).sort({ date: -1 }).toArray()

    return NextResponse.json(ledgerEntries)
  } catch (error) {
    console.error("Failed to fetch ledger entries:", error)
    return NextResponse.json({ error: "Failed to fetch ledger entries" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as { user?: { id?: string } } | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const companyId = session.user.id
    const { db } = await connectToDatabase()
    const data = await request.json()

    // Add timestamps and company ID
    const entry = {
      ...data,
      date: new Date(data.date),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection(collections.ledger).insertOne(entry)

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      entry: { ...entry, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Failed to create ledger entry:", error)
    return NextResponse.json({ error: "Failed to create ledger entry" }, { status: 500 })
  }
}
