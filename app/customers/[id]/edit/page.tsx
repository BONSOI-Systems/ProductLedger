"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Image from "next/image"
// import use from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { updateCustomer } from "@/lib/actions"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  panCard: z.string().optional(),
  aadharCard: z.string().optional(),
  imageUrl: z.string().optional(),
})

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  
    // Initialize the form outside of conditional logic
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: "",
        email: "",
        phone: "",
        address: "",
        panCard: "",
        aadharCard: "",
        imageUrl: "",
      },
    });
  
    useEffect(() => {
      params.then(setResolvedParams);
    }, [params]);
  
    useEffect(() => {
      if (!resolvedParams) return;
  
      async function fetchCustomer() {
        try {
          if (!resolvedParams) {
            throw new Error("Resolved parameters are null");
          }
          const response = await fetch(`/api/customers/${resolvedParams.id}`);
          if (response.ok) {
            const customer = await response.json();
            form.reset({
              name: customer.name,
              email: customer.email,
              phone: customer.phone || "",
              address: customer.address || "",
              panCard: customer.panCard || "",
              aadharCard: customer.aadharCard || "",
              imageUrl: customer.imageUrl || "",
            });
  
            if (customer.imageUrl) {
              setImagePreview(customer.imageUrl);
            }
          } else {
            toast({
              title: "Error",
              description: "Failed to fetch customer details.",
              variant: "destructive",
            });
            router.push("/customers");
          }
        } catch (error) {
          console.error("Error fetching customer:", error);
          toast({
            title: "Error",
            description: "Failed to fetch customer details.",
            variant: "destructive",
          });
          router.push("/customers");
        } finally {
          setIsLoading(false);
        }
      }
  
      fetchCustomer();
    }, [resolvedParams, form, router]);
  
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
  
    async function onSubmit(values: z.infer<typeof formSchema>) {
      setIsSubmitting(true);
  
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value) {
            formData.append(key, value);
          }
        });
  
        if (imageFile) {
          formData.append("image", imageFile);
        }
  
        const result = await updateCustomer(resolvedParams!.id, formData);
  
        if (result.success) {
          toast({
            title: "Customer updated",
            description: "Customer information has been updated successfully.",
          });
          router.push(`/customers/${resolvedParams!.id}/view`);
        } else {
          throw new Error(result.error || "Failed to update customer");
        }
      } catch (error) {
        console.error("Error updating customer:", error);
        toast({
          title: "Error",
          description: "Failed to update customer. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  
    if (!resolvedParams || isLoading) {
      return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Edit Customer</h2>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Loading customer details...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      );
    }
  
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Edit Customer</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>Update customer information</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Customer Photo</FormLabel>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <div className="h-20 w-20 rounded-full overflow-hidden bg-muted">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Customer"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <Input type="file" accept="image/*" onChange={handleImageChange} />
                  </div>
                </div>
  
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
  
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="customer@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
  
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="panCard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAN Card Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter PAN card number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="aadharCard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aadhar Card Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Aadhar card number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
  
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter customer address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    );
  }