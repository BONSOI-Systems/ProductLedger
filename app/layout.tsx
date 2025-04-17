import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { SideNav } from "@/components/side-nav"
import { TopNav } from "@/components/top-nav"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Product Ledger - Business Management System",
  description: "Manage your product inventory, ledger, and overdue payments",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)
  const isAuthenticated = !!session

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {isAuthenticated ? (
              <div className="flex min-h-screen flex-col">
                <TopNav />
                <div className="flex flex-1">
                  <SideNav />
                  <main className="flex-1 overflow-auto">{children}</main>
                </div>
              </div>
            ) : (
              <main>{children}</main>
            )}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}