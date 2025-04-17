import { notFound } from "next/navigation"
import Link from "next/link"
import { connectToDatabase, collections } from "@/lib/db"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { format } from "date-fns"
import { User, Edit, ArrowLeft, Mail, Phone, MapPin, CreditCard, FileText } from "lucide-react"
import { use } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

interface LedgerEntry {
  _id: ObjectId
  description: string
  date: string
  type: "Cash In" | "Cash Out"
  amount: number
}

export default async function ViewCustomerPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params; // Await params to resolve it
    const customerId = resolvedParams.id;
  
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return <div>Not authenticated</div>;
    }
  
    const companyId = session.user.id;
    const { db } = await connectToDatabase();
  
    let customer;
    try {
      customer = await db.collection(collections.customers).findOne({
        _id: new ObjectId(customerId),
        companyId,
      });
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  
    if (!customer) {
      notFound();
    }
  
    // Get customer's ledger entries
    let ledgerEntries = [];
    try {
      ledgerEntries = await db
        .collection(collections.ledger)
        .find({ customerId: new ObjectId(customerId), companyId })
        .sort({ date: -1 })
        .limit(5)
        .toArray();
    } catch (error) {
      console.error("Error fetching ledger entries:", error);
    }
  
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Customer Details</h2>
          <div className="flex items-center space-x-2">
            <Link href={`/customers/${customerId}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Customer
              </Button>
            </Link>
          </div>
        </div>
  
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted overflow-hidden">
                {customer.imageUrl ? (
                  <Image
                    src={customer.imageUrl || "/placeholder.svg"}
                    alt={customer.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-blue-500" />
                )}
              </div>
              <div>
                <CardTitle>{customer.name}</CardTitle>
                <CardDescription>Customer since {format(new Date(customer.createdAt), "MMMM yyyy")}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-blue-500" />
                    <span>{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-green-500" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start">
                      <MapPin className="mr-2 h-4 w-4 text-red-500 mt-1" />
                      <span>{customer.address}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {customer.panCard && (
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4 text-purple-500" />
                      <span>PAN: {customer.panCard}</span>
                    </div>
                  )}
                  {customer.aadharCard && (
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-amber-500" />
                      <span>Aadhar: {customer.aadharCard}</span>
                    </div>
                  )}
                </div>
              </div>
  
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Transactions</h3>
                {ledgerEntries.length > 0 ? (
                  <div className="space-y-2">
                    {ledgerEntries.map((entry: LedgerEntry) => (
                      <div
                        key={entry._id.toString()}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                      >
                        <div>
                          <p className="text-sm font-medium">{entry.description}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(entry.date), "PPP")}</p>
                        </div>
                        <div className={`font-medium ${entry.type === "Cash In" ? "text-green-600" : "text-red-600"}`}>
                          {entry.type === "Cash In" ? "+" : "-"}₹{entry.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No transactions found for this customer.</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="/customers">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Customers
                </Link>
              </Button>
            </CardFooter>
          </Card>
  
          <Card>
            <CardHeader>
              <CardTitle>Customer Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Transactions</h3>
                <p className="text-2xl font-bold">{ledgerEntries.length}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Activity</h3>
                <p className="text-base">
                  {ledgerEntries.length > 0 ? format(new Date(ledgerEntries[0].date), "PPP") : "No activity"}
                </p>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-muted-foreground">Additional Information</h3>
                <div className="mt-2 space-y-2">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Created At</h4>
                    <p className="text-sm">{format(new Date(customer.createdAt), "PPP")}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Last Updated</h4>
                    <p className="text-sm">{format(new Date(customer.updatedAt), "PPP")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }