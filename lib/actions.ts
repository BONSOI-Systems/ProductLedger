"use server"

import { revalidatePath } from "next/cache"
import { connectToDatabase, collections } from "@/lib/db"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Helper to get user company ID
async function getUserCompanyId() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }
  return session.user.id
}

// Ledger Actions
export async function createLedgerEntry(formData: FormData) {
  try {
    const { db } = await connectToDatabase()
    const companyId = await getUserCompanyId()

    const entry = {
      date: new Date(formData.get("date") as string),
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      amount: Number.parseFloat(formData.get("amount") as string),
      status: formData.get("status") as string,
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
      notes: formData.get("notes") as string,
      customerId: formData.get("customerId") ? new ObjectId(formData.get("customerId") as string) : null,
      companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection(collections.ledger).insertOne(entry)

    revalidatePath("/ledger")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Failed to create ledger entry:", error)
    return { success: false, error: "Failed to create ledger entry" }
  }
}

export async function updateLedgerEntry(id: string, formData: FormData) {
  try {
    const { db } = await connectToDatabase()
    const companyId = await getUserCompanyId()

    const entry = {
      date: new Date(formData.get("date") as string),
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      amount: Number.parseFloat(formData.get("amount") as string),
      status: formData.get("status") as string,
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
      notes: formData.get("notes") as string,
      customerId: formData.get("customerId") ? new ObjectId(formData.get("customerId") as string) : null,
      updatedAt: new Date(),
    }

    await db.collection(collections.ledger).updateOne({ _id: new ObjectId(id), companyId }, { $set: entry })

    revalidatePath("/ledger")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Failed to update ledger entry:", error)
    return { success: false, error: "Failed to update ledger entry" }
  }
}

export async function deleteLedgerEntry(id: string) {
  try {
    const { db } = await connectToDatabase()
    const companyId = await getUserCompanyId()

    await db.collection(collections.ledger).deleteOne({
      _id: new ObjectId(id),
      companyId,
    })

    revalidatePath("/ledger")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Failed to delete ledger entry:", error)
    return { success: false, error: "Failed to delete ledger entry" }
  }
}

// Product Actions
export async function createProduct(formData: FormData) {
  try {
    const { db } = await connectToDatabase()
    const companyId = await getUserCompanyId()

    const product = {
      name: formData.get("name") as string,
      sku: formData.get("sku") as string,
      description: formData.get("description") as string,
      price: Number.parseFloat(formData.get("price") as string),
      stock: Number.parseInt(formData.get("stock") as string),
      category: formData.get("category") as string,
      companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection(collections.products).insertOne(product)

    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Failed to create product:", error)
    return { success: false, error: "Failed to create product" }
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const { db } = await connectToDatabase()
    const companyId = await getUserCompanyId()

    const product = {
      name: formData.get("name") as string,
      sku: formData.get("sku") as string,
      description: formData.get("description") as string,
      price: Number.parseFloat(formData.get("price") as string),
      stock: Number.parseInt(formData.get("stock") as string),
      category: formData.get("category") as string,
      updatedAt: new Date(),
    }

    await db.collection(collections.products).updateOne({ _id: new ObjectId(id), companyId }, { $set: product })

    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Failed to update product:", error)
    return { success: false, error: "Failed to update product" }
  }
}

export async function deleteProduct(id: string) {
  try {
    const { db } = await connectToDatabase()
    const companyId = await getUserCompanyId()

    await db.collection(collections.products).deleteOne({
      _id: new ObjectId(id),
      companyId,
    })

    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Failed to delete product:", error)
    return { success: false, error: "Failed to delete product" }
  }
}

// Customer Actions
export async function createCustomer(formData: FormData) {
  try {
    const { db } = await connectToDatabase()
    const companyId = await getUserCompanyId()

    const customer = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection(collections.customers).insertOne(customer)

    revalidatePath("/customers")

    return { success: true }
  } catch (error) {
    console.error("Failed to create customer:", error)
    return { success: false, error: "Failed to create customer" }
  }
}

export async function updateCustomer(id: string, formData: FormData) {
  try {
    const { db } = await connectToDatabase()
    const companyId = await getUserCompanyId()

    const customer = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      updatedAt: new Date(),
    }

    await db.collection(collections.customers).updateOne({ _id: new ObjectId(id), companyId }, { $set: customer })

    revalidatePath("/customers")

    return { success: true }
  } catch (error) {
    console.error("Failed to update customer:", error)
    return { success: false, error: "Failed to update customer" }
  }
}

export async function deleteCustomer(id: string) {
  try {
    const { db } = await connectToDatabase()
    const companyId = await getUserCompanyId()

    await db.collection(collections.customers).deleteOne({
      _id: new ObjectId(id),
      companyId,
    })

    revalidatePath("/customers")

    return { success: true }
  } catch (error) {
    console.error("Failed to delete customer:", error)
    return { success: false, error: "Failed to delete customer" }
  }
}

// Overdue Settings Actions
export async function updateOverdueSettings(formData: FormData) {
  try {
    const { db } = await connectToDatabase()
    const companyId = await getUserCompanyId()

    const settings = {
      gracePeriod: Number.parseInt(formData.get("gracePeriod") as string),
      interestRate: Number.parseFloat(formData.get("interestRate") as string) / 100, // Convert from percentage
      compoundingPeriod: formData.get("compoundingPeriod") as string,
      minimumFee: Number.parseFloat(formData.get("minimumFee") as string),
      companyId,
      updatedAt: new Date(),
    }

    await db.collection(collections.overdueSettings).updateOne({ companyId }, { $set: settings }, { upsert: true })

    revalidatePath("/admin/settings")
    revalidatePath("/overdue")

    return { success: true }
  } catch (error) {
    console.error("Failed to update overdue settings:", error)
    return { success: false, error: "Failed to update overdue settings" }
  }
}

// Mark ledger entry as paid
export async function markLedgerEntryAsPaid(id: string) {
  try {
    const { db } = await connectToDatabase()
    const companyId = await getUserCompanyId()

    await db
      .collection(collections.ledger)
      .updateOne({ _id: new ObjectId(id), companyId }, { $set: { status: "Paid", updatedAt: new Date() } })

    revalidatePath("/ledger")
    revalidatePath("/overdue")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Failed to mark ledger entry as paid:", error)
    return { success: false, error: "Failed to mark ledger entry as paid" }
  }
}