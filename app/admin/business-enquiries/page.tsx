"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Mail, MessageSquareText, Phone } from "lucide-react"
import { AdminHeader } from "@/components/layout/admin/admin-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { defaultSiteSettings, type SiteSettings } from "@/lib/site-settings"

type EnquiriesResponse = {
  success: boolean
  error?: string
  data?: {
    summary: {
      total: number
      newCount: number
      contactedCount: number
      qualifiedCount: number
      closedCount: number
    }
    enquiries: Array<{
      id: string
      name: string
      company: string
      email: string
      phone: string
      type: string
      quantity: string
      message: string
      status: string
      createdAt: string
      updatedAt: string
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

function getStatusClass(status: string) {
  switch (status) {
    case "new":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "contacted":
      return "border-blue-200 bg-blue-50 text-blue-700"
    case "qualified":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "closed":
      return "border-slate-200 bg-slate-100 text-slate-700"
    default:
      return "border-slate-200 bg-slate-50 text-slate-700"
  }
}

function EnquirySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-2 h-3 w-64" />
            <Skeleton className="mt-3 h-3 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function AdminBusinessEnquiriesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState({ total: 0, newCount: 0, contactedCount: 0, qualifiedCount: 0, closedCount: 0 })
  const [enquiries, setEnquiries] = useState<NonNullable<EnquiriesResponse["data"]>["enquiries"]>([])
  const [contact, setContact] = useState<SiteSettings>(defaultSiteSettings)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const [enquiriesResponse, settingsResponse] = await Promise.all([
          fetch("/api/admin/business-enquiries", { cache: "no-store" }),
          fetch("/api/site-settings", { cache: "no-store" }),
        ])

        const payload = (await enquiriesResponse.json()) as EnquiriesResponse
        const settingsPayload = (await settingsResponse.json()) as { success: boolean; data?: SiteSettings }

        if (!enquiriesResponse.ok || !payload.success || !payload.data) {
          throw new Error(payload.error || "Failed to load enquiries")
        }

        if (!settingsResponse.ok || !settingsPayload.success || !settingsPayload.data) {
          throw new Error("Failed to load settings")
        }

        if (active) {
          setSummary(payload.data.summary)
          setEnquiries(payload.data.enquiries || [])
          setContact(settingsPayload.data)
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load enquiries")
          setEnquiries([])
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
      <AdminHeader title="Business Enquiries" description="Wholesale, gifting, and partnership requests" />

      <div className="space-y-6 p-4 lg:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{loading ? "..." : summary.total}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">New</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{loading ? "..." : summary.newCount}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Contacted</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{loading ? "..." : summary.contactedCount}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Qualified</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{loading ? "..." : summary.qualifiedCount}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Closed</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{loading ? "..." : summary.closedCount}</p>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50/70 shadow-sm">
            <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
          </Card>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
          <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Latest Enquiries</CardTitle>
                <p className="text-sm text-muted-foreground">Captured from the public business enquiry form</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/contact" className="gap-1">
                  View form
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-5">
                  <EnquirySkeleton />
                </div>
              ) : enquiries.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquareText className="mx-auto h-10 w-10 text-amber-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-800">No enquiries yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Business leads submitted from the website will appear here automatically.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Lead</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enquiries.map((enquiry) => (
                        <TableRow key={enquiry.id} className="transition-colors hover:bg-slate-50/70">
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-950">{enquiry.name}</p>
                              <p className="text-xs text-muted-foreground">{enquiry.company}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{enquiry.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{enquiry.type}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusClass(enquiry.status)}>
                              {enquiry.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{formatDate(enquiry.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
              <CardHeader>
                <CardTitle>Response Paths</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Wholesale</p>
                  <p className="mt-1">Use the lead details here to coordinate price tiers and MOQ.</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Corporate gifting</p>
                  <p className="mt-1">Reach out directly from the enquiry details for custom hampers and seasonal demand.</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Fallback</p>
                  <p className="mt-1">If needed, route the user to the public contact page for a manual response path.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
              <CardHeader>
                <CardTitle>Support Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-600" />
                  {contact.supportEmail}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-amber-600" />
                  {contact.supportPhone}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}