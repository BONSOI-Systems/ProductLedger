import { NextResponse } from "next/server"
import { connectToDatabase, collections } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session: { user?: { id: string } } | null = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const companyId = session.user.id
    const { db } = await connectToDatabase()

    // Get overdue settings for this company
    const settings = (await db.collection(collections.overdueSettings).findOne({ companyId })) || {
      gracePeriod: 7,
      interestRate: 0.15, // 15% annual interest rate
      compoundingPeriod: "daily",
      minimumFee: 5,
      companyId,
    }

    // Find all entries that are past due date and not paid for this company
    const today = new Date()
    const overdueEntries = await db
      .collection(collections.ledger)
      .find({
        companyId,
        dueDate: { $lt: today },
        status: { $ne: "Paid" },
      })
      .sort({ dueDate: 1 })
      .toArray()

    // Calculate interest for each overdue entry
    const entriesWithInterest = overdueEntries.map((entry: { dueDate: string; amount: number }) => {
      const dueDate = new Date(entry.dueDate)
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

      // Only apply interest after grace period
      if (daysOverdue <= settings.gracePeriod) {
        return { ...entry, daysOverdue, interest: 0, totalDue: entry.amount }
      }

      // Calculate interest based on settings
      const effectiveDaysOverdue = daysOverdue - settings.gracePeriod
      const dailyRate = settings.interestRate / 365

      let interest = 0
      if (settings.compoundingPeriod === "daily") {
        interest = entry.amount * (Math.pow(1 + dailyRate, effectiveDaysOverdue) - 1)
      } else if (settings.compoundingPeriod === "weekly") {
        const weeks = Math.floor(effectiveDaysOverdue / 7)
        const remainingDays = effectiveDaysOverdue % 7
        const weeklyRate = dailyRate * 7
        interest = entry.amount * (Math.pow(1 + weeklyRate, weeks) * (1 + dailyRate * remainingDays) - 1)
      } else {
        // monthly
        const months = Math.floor(effectiveDaysOverdue / 30)
        const remainingDays = effectiveDaysOverdue % 30
        const monthlyRate = dailyRate * 30
        interest = entry.amount * (Math.pow(1 + monthlyRate, months) * (1 + dailyRate * remainingDays) - 1)
      }

      // Apply minimum fee if needed
      interest = Math.max(interest, settings.minimumFee)

      return {
        ...entry,
        daysOverdue,
        interest,
        totalDue: entry.amount + interest,
      }
    })

    return NextResponse.json(entriesWithInterest)
  } catch (error) {
    console.error("Failed to fetch overdue entries:", error)
    return NextResponse.json({ error: "Failed to fetch overdue entries" }, { status: 500 })
  }
}
