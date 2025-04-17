import { NextResponse } from "next/server"
import { connectToDatabase, collections } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session: { user?: { id?: string } } | null = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const companyId = session.user.id
    const { db } = await connectToDatabase()

    const products = await db.collection(collections.products).find({ companyId }).sort({ name: 1 }).toArray()

    return NextResponse.json(products)
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
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
    const product = {
      ...data,
      stock: Number(data.stock),
      price: Number(data.price),
      companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection(collections.products).insertOne(product)

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      product: { ...product, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Failed to create product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
