import { notFound } from "next/navigation"
import Link from "next/link"
import { connectToDatabase, collections } from "@/lib/db"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
// import { format } from "date-fns"
import { Package, Edit, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ViewProductPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return <div>Not authenticated</div>
  }

  const companyId = session.user.id
  const { db } = await connectToDatabase()

  let product
  try {
    product = await db.collection(collections.products).findOne({
      _id: new ObjectId(params.id),
      companyId,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
  }

  if (!product) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Product Details</h2>
        <div className="flex items-center space-x-2">
          <Link href={`/products/${params.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
            <Package className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>SKU: {product.sku}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                <p className="mt-1 text-lg font-semibold">₹{product.price.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Stock</h3>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      product.stock > 10
                        ? "bg-green-100 text-green-800"
                        : product.stock > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.stock > 0 ? `${product.stock} units` : "Out of stock"}
                  </span>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                <p className="mt-1">{product.category}</p>
              </div>
            </div>
          </div>

          {/* <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground">Additional Information</h3>
            <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground">Created At</h4>
                <p className="mt-1">{format(new Date(product.createdAt), "PPP")}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground">Last Updated</h4>
                <p className="mt-1">{format(new Date(product.updatedAt), "PPP")}</p>
              </div>
            </div>
          </div> */}
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
