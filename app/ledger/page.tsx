import { Suspense } from "react"
import Link from "next/link"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { connectToDatabase, collections } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { format } from "date-fns"
import { deleteLedgerEntry, markLedgerEntryAsPaid } from "@/lib/actions"

export default function LedgerPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Ledger</h2>
        <div className="flex items-center space-x-2">
          <Link href="/ledger/new-entry">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </Link>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ledger Entries</CardTitle>
          <CardDescription>View and manage all your cash flow transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-4">
            <Input placeholder="Filter entries..." className="max-w-sm" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>Date</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked>Description</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked>Type</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked>Amount</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked>Status</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked>Due Date</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Suspense fallback={<LedgerTableSkeleton />}>
            <LedgerTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

interface LedgerEntry {
  _id: string;
  date: string;
  description: string;
  type: "Cash In" | "Cash Out";
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  dueDate?: string;
}

async function LedgerTable() {
  // Get user session
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return <div>Not authenticated</div>
  }

  const companyId = session.user.id

  // Fetch real data from MongoDB
  const { db } = await connectToDatabase()
  const ledgerEntries = await db.collection(collections.ledger).find({ companyId }).sort({ date: -1 }).toArray()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              <Button variant="ghost" className="p-0 font-medium">
                Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 font-medium">
                Description
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 font-medium">
                Type
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" className="p-0 font-medium">
                Amount
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 font-medium">
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 font-medium">
                Due Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
          {ledgerEntries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No ledger entries found. Add your first entry to get started.
              </TableCell>
            </TableRow>
          ) : (
            ledgerEntries.map((entry: LedgerEntry) => (
              <TableRow key={entry._id.toString()}>
                <TableCell className="font-medium">{format(new Date(entry.date), "MMM d, yyyy")}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      entry.type === "Cash In" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {entry.type}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={entry.type === "Cash In" ? "text-green-600" : "text-red-600"}>
                    {entry.type === "Cash In" ? "+" : "-"}₹{entry.amount.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>{entry.dueDate ? format(new Date(entry.dueDate), "MMM d, yyyy") : "-"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/ledger/${entry._id}/view`}>View details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/ledger/${entry._id}/edit`}>Edit entry</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {entry.status !== "Paid" && (
                        <DropdownMenuItem asChild>
                          <form
                            action={async () => {
                              "use server"
                              await markLedgerEntryAsPaid(entry._id.toString())
                            }}
                          >
                            <button className="w-full text-left text-green-600">Mark as paid</button>
                          </form>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <form
                          action={async () => {
                            "use server"
                            await deleteLedgerEntry(entry._id.toString())
                          }}
                        >
                          <button className="w-full text-left text-red-600">Delete entry</button>
                        </form>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function LedgerTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[60px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[80px] ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[60px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}