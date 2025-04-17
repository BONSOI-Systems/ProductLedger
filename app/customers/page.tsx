import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CustomersTable } from "@/components/customers/customers-table"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

export default function CustomersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <div className="flex items-center space-x-2">
          <Link href="/customers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </Link>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>Manage your customer information and transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input placeholder="Search customers..." className="max-w-sm" />
          </div>
          <Suspense fallback={<DashboardSkeleton />}>
            <CustomersTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}