"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { updateOverdueSettings } from "@/lib/actions"

export default function AdminSettingsPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settings, setSettings] = useState({
    gracePeriod: 7,
    interestRate: 15, // Stored as percentage for UI
    compoundingPeriod: "daily",
    minimumFee: 5,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/overdue/settings")
        if (response.ok) {
          const data = await response.json()
          setSettings({
            gracePeriod: data.gracePeriod || 7,
            interestRate: (data.interestRate || 0.15) * 100, // Convert to percentage for UI
            compoundingPeriod: data.compoundingPeriod || "daily",
            minimumFee: data.minimumFee || 5,
          })
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await updateOverdueSettings(formData)

      if (result.success) {
        toast({
          title: "Settings updated",
          description: "Your overdue settings have been updated successfully.",
        })
      } else {
        throw new Error(result.error || "Failed to update settings")
      }
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading settings...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Overdue Payment Settings</CardTitle>
          <CardDescription>Configure how overdue payments are handled</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FormLabel htmlFor="gracePeriod">Grace Period (days)</FormLabel>
                <Input
                  id="gracePeriod"
                  name="gracePeriod"
                  type="number"
                  min="0"
                  defaultValue={settings.gracePeriod}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Number of days after due date before interest is applied
                </p>
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="interestRate">Annual Interest Rate (%)</FormLabel>
                <Input
                  id="interestRate"
                  name="interestRate"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={settings.interestRate}
                  required
                />
                <p className="text-xs text-muted-foreground">Annual interest rate applied to overdue payments</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FormLabel htmlFor="compoundingPeriod">Compounding Period</FormLabel>
                <Select name="compoundingPeriod" defaultValue={settings.compoundingPeriod} required>
                  <SelectTrigger id="compoundingPeriod">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">How often interest is compounded on overdue payments</p>
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="minimumFee">Minimum Fee (₹)</FormLabel>
                <Input
                  id="minimumFee"
                  name="minimumFee"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={settings.minimumFee}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Minimum fee applied to overdue payments regardless of interest calculation
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
