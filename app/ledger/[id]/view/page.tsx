import { notFound } from "next/navigation"
import Link from "next/link"
import { connectToDatabase, collections } from "@/lib/db"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { format } from "date-fns"
import { DollarSign, Edit, ArrowLeft, User } from "lucide-react"
import { use } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { markLedgerEntryAsPaid } from "@/lib/actions"

export default async function ViewLedgerEntryPage({ params }: { params: Promise<{ id: string }> }) {
  // Use React.use to unwrap the params promise
  const resolvedParams = use(params)
  const entryId = resolvedParams.id

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return <div>Not authenticated</div>
  }

  const companyId = session.user.id
  const { db } = await connectToDatabase()

  let entry
  let customer = null
  try {
    entry = await db.collection(collections.ledger).findOne({
      _id: new ObjectId(entryId),
      companyId,
    })

    if (entry?.customerId) {
      customer = await db.collection(collections.customers).findOne({
        _id: new ObjectId(entry.customerId),
      })
    }
  } catch (error) {
    console.error("Error fetching ledger entry:", error)
  }

  if (!entry) {
    notFound()
  }

  // Create a server action that uses the entryId
  const markAsPaidAction = async () => {
    "use server"
    await markLedgerEntryAsPaid(entryId)
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Ledger Entry Details</h2>
        <div className="flex items-center space-x-2">
          <Link href={`/ledger/${entryId}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Entry
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
            <DollarSign className={`h-8 w-8 ${entry.type === "Cash In" ? "text-green-500" : "text-red-500"}`} />
          </div>
          <div>
            <CardTitle>{entry.description}</CardTitle>
            <CardDescription>
              {entry.type} • {format(new Date(entry.date), "PPP")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                <p
                  className={`mt-1 text-lg font-semibold ${entry.type === "Cash In" ? "text-green-600" : "text-red-600"}`}
                >
                  {entry.type === "Cash In" ? "+" : "-"}₹{entry.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      entry.status === "Paid"
                        ? "bg-green-100 text-green-800"
                        : entry.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {entry.status}
                  </span>
                </p>
              </div>
              {entry.dueDate && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                  <p className="mt-1">{format(new Date(entry.dueDate), "PPP")}</p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {customer && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                  <div className="mt-1 flex items-center">
                    <User className="mr-2 h-4 w-4 text-blue-500" />
                    <Link href={`/customers/${customer._id}/view`} className="text-blue-600 hover:underline">
                      {customer.name}
                    </Link>
                  </div>
                </div>
              )}
              {entry.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <p className="mt-1">{entry.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground">Additional Information</h3>
            <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground">Created At</h4>
                <p className="mt-1">{format(new Date(entry.createdAt), "PPP")}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground">Last Updated</h4>
                <p className="mt-1">{format(new Date(entry.updatedAt), "PPP")}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/ledger">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Ledger
            </Link>
          </Button>
          {entry.status !== "Paid" && (
            <form action={markAsPaidAction}>
              <Button type="submit" variant="default" className="bg-green-600 hover:bg-green-700">
                Mark as Paid
              </Button>
            </form>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}