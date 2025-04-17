import { NextResponse } from "next/server";
import { connectToDatabase, collections } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const resolvedParams = await context.params; // Await params
    const companyId = session.user.id;
    const { db } = await connectToDatabase();

    const customer = await db.collection(collections.customers).findOne({
      _id: new ObjectId(resolvedParams.id),
      companyId,
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const resolvedParams = await context.params; // Await params
    const companyId = session.user.id;
    const { db } = await connectToDatabase();
    const data = await request.json();

    // Add timestamps
    const customer = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await db
      .collection(collections.customers)
      .updateOne({ _id: new ObjectId(resolvedParams.id), companyId }, { $set: customer });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      id: resolvedParams.id,
    });
  } catch (error) {
    console.error("Failed to update customer:", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const resolvedParams = await context.params; // Await params
    const companyId = session.user.id;
    const { db } = await connectToDatabase();

    const result = await db.collection(collections.customers).deleteOne({
      _id: new ObjectId(resolvedParams.id),
      companyId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete customer:", error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}