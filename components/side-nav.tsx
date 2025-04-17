"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CreditCard, DollarSign, Home, Package, Settings, ShieldCheck, Users } from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
    color: "text-blue-500",
  },
  {
    title: "Ledger",
    href: "/ledger",
    icon: DollarSign,
    color: "text-emerald-500",
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
    color: "text-blue-500",
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
    color: "text-purple-500",
  },
  {
    title: "Overdue",
    href: "/overdue",
    icon: CreditCard,
    color: "text-red-500",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    color: "text-amber-500",
  },
  {
    title: "Admin Portal",
    href: "/admin",
    icon: ShieldCheck,
    color: "text-green-500",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    color: "text-gray-500",
  },
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-background md:block">
      <div className="flex h-full max-h-screen flex-col gap-2 p-4">
        <div className="flex h-14 items-center border-b px-4 font-semibold">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6 text-primary" />
            <span>Product Ledger</span>
          </Link>
        </div>
        <div className="flex-1 py-4">
          <nav className="grid gap-1">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-accent text-accent-foreground"
                    : "transparent",
                )}
              >
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}