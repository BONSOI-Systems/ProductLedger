import { MongoClient, type ObjectId, type Db  } from "mongodb"

// MongoDB connection string would come from environment variables
const MONGODB_URI = process.env.MONGODB_URI || ""
const MONGODB_DB = process.env.MONGODB_DB || "product_ledger"

// Cache the MongoDB connection
let cachedClient: MongoClient | null = null

let cachedDb: Db | null = null

export async function connectToDatabase() {
  // If we have a cached connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  // If no cached connection, create a new one
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable")
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 10000, // Reduce timeout to 10 seconds
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 10000,
    })

    await client.connect()
    const db = client.db(MONGODB_DB)

    // Cache the connection
    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)

    // Return a mock database for development/fallback
    return {
      client: null,
      db: {
        collection: () => ({
          find: () => ({
            sort: () => ({
              toArray: async () => [],
            }),
          }),
          findOne: async () => null,
          aggregate: () => ({
            toArray: async () => [],
          }),
          countDocuments: async () => 0,
          insertOne: async () => ({ insertedId: "mock-id" }),
          updateOne: async () => ({ modifiedCount: 1 }),
          deleteOne: async () => ({ deletedCount: 1 }),
        }),
      },
    }
  }
}

// Define collection names
export const collections = {
  ledger: "ledger",
  products: "products",
  customers: "customers",
  overdueSettings: "overdueSettings",
  users: "users",
  passwordResets: "passwordResets",
}

// Example schema for a ledger entry
export interface LedgerEntry {
  _id?: ObjectId
  date: Date
  description: string
  type: "Cash In" | "Cash Out"
  amount: number
  status: "Paid" | "Pending" | "Overdue"
  dueDate?: Date
  notes?: string
  customerId?: ObjectId
  productIds?: ObjectId[]
  createdAt: Date
  updatedAt: Date
  companyId: string
}

// Example schema for a product
export interface Product {
  _id?: ObjectId
  name: string
  sku: string
  description?: string
  price: number
  stock: number
  category: string
  createdAt: Date
  updatedAt: Date
  companyId: string
}

// Example schema for overdue settings
export interface OverdueSettings {
  _id?: ObjectId
  gracePeriod: number // Days before an entry is considered overdue
  interestRate: number // Annual interest rate for overdue entries
  compoundingPeriod: "daily" | "weekly" | "monthly" // How often interest compounds
  minimumFee: number // Minimum fee for overdue entries
  createdAt: Date
  updatedAt: Date
  companyId: string
}

// User schema
export interface User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  companyName: string
  role: "admin" | "user"
  createdAt: Date
  updatedAt: Date
}

// Password reset schema
export interface PasswordReset {
  _id?: ObjectId
  userId: ObjectId
  token: string
  expires: Date
  createdAt: Date
}