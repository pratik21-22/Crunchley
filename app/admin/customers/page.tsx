"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Mail, UserRound } from "lucide-react"
import { AdminHeader } from "@/components/layout/admin/admin-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type DashboardResponse = {
  success: boolean
  error?: string
  data?: {
    summary: {
      uniqueCustomers: number
    }
    latestCustomers: Array<{
      name: string
      email: string
      orders: number
      lastOrderAt: string
    }>
  }
}

function formatDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AdminCustomersPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [latestCustomers, setLatestCustomers] = useState<NonNullable<DashboardResponse["data"]>["latestCustomers"]>([])
  const [uniqueCustomers, setUniqueCustomers] = useState(0)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const response = await fetch("/api/admin/dashboard", { cache: "no-store" })
        const payload = (await response.json()) as DashboardResponse

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.error || "Failed to load customers")
        }

        if (active) {
          setLatestCustomers(payload.data.latestCustomers || [])
          setUniqueCustomers(payload.data.summary.uniqueCustomers || 0)
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load customers")
          setLatestCustomers([])
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <AdminHeader title="Customers" description="Recent customer activity and repeat buyers" />

      <div className="space-y-6 p-4 lg:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Unique Customers</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{loading ? "..." : uniqueCustomers}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Latest Customers</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{loading ? "..." : latestCustomers.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
            <CardContent className="flex h-full items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Support Path</p>
                <p className="mt-2 text-base font-semibold text-slate-950">Customer questions are handled through support</p>
              </div>
              <UserRound className="h-5 w-5 text-amber-600" />
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50/70 shadow-sm">
            <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Latest Customers</CardTitle>
              <p className="text-sm text-muted-foreground">Derived from recent order history</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders" className="gap-1">
                Review orders
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead className="hidden md:table-cell">Last Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      Loading customer activity...
                    </TableCell>
                  </TableRow>
                ) : latestCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No customer history yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  latestCustomers.map((customer) => (
                    <TableRow key={customer.email}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                          {customer.orders}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{formatDate(customer.lastOrderAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}