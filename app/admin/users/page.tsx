"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Shield, Users } from "lucide-react"
import { AdminHeader } from "@/components/layout/admin/admin-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type UsersResponse = {
	success: boolean
	error?: string
	data?: {
		summary: {
			total: number
			admins: number
			customers: number
		}
		users: Array<{
			id: string
			name: string
			email: string
			role: "user" | "admin"
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

function UsersSkeleton() {
	return (
		<div className="space-y-4">
			{Array.from({ length: 5 }).map((_, index) => (
				<Card key={index} className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
					<CardContent className="flex items-center gap-4 p-4">
						<Skeleton className="h-11 w-11 rounded-full" />
						<div className="flex-1">
							<Skeleton className="h-4 w-40" />
							<Skeleton className="mt-2 h-3 w-60" />
						</div>
						<Skeleton className="h-8 w-20 rounded-full" />
					</CardContent>
				</Card>
			))}
		</div>
	)
}

export default function AdminUsersPage() {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [summary, setSummary] = useState({ total: 0, admins: 0, customers: 0 })
	const [users, setUsers] = useState<NonNullable<UsersResponse["data"]>["users"]>([])

	useEffect(() => {
		let active = true

		const load = async () => {
			try {
				const response = await fetch("/api/admin/users", { cache: "no-store" })
				const payload = (await response.json()) as UsersResponse

				if (!response.ok || !payload.success || !payload.data) {
					throw new Error(payload.error || "Failed to load users")
				}

				if (active) {
					setSummary(payload.data.summary)
					setUsers(payload.data.users || [])
				}
			} catch (err: unknown) {
				if (active) {
					setError(err instanceof Error ? err.message : "Failed to load users")
					setUsers([])
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
			<AdminHeader title="Users" description="All registered Crunchley accounts" />

			<div className="space-y-6 p-4 lg:p-6">
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					<Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
						<CardContent className="p-5">
							<p className="text-sm text-muted-foreground">Total Users</p>
							<p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{loading ? "..." : summary.total}</p>
						</CardContent>
					</Card>
					<Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
						<CardContent className="p-5">
							<p className="text-sm text-muted-foreground">Customers</p>
							<p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{loading ? "..." : summary.customers}</p>
						</CardContent>
					</Card>
					<Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
						<CardContent className="flex items-center justify-between p-5">
							<div>
								<p className="text-sm text-muted-foreground">Admins</p>
								<p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{loading ? "..." : summary.admins}</p>
							</div>
							<Shield className="h-5 w-5 text-amber-600" />
						</CardContent>
					</Card>
				</div>

				{error && (
					<Card className="border-red-200 bg-red-50/70 shadow-sm">
						<CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
					</Card>
				)}

				<Card className="border-0 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
					<CardContent className="p-0">
						{loading ? (
							<div className="p-5">
								<UsersSkeleton />
							</div>
						) : users.length === 0 ? (
							<div className="p-8 text-center">
								<Users className="mx-auto h-10 w-10 text-amber-300" />
								<p className="mt-3 text-sm font-semibold text-slate-800">No users found</p>
								<p className="mt-1 text-sm text-muted-foreground">Accounts created by signup will appear here automatically.</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow className="hover:bg-transparent">
										<TableHead>User</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Role</TableHead>
										<TableHead className="hidden md:table-cell">Created</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{users.map((user) => (
										<TableRow key={user.id} className="transition-colors hover:bg-slate-50/70">
											<TableCell className="font-medium">{user.name}</TableCell>
											<TableCell className="text-muted-foreground">{user.email}</TableCell>
											<TableCell>
												<Badge variant="outline" className={user.role === "admin" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-700"}>
													{user.role}
												</Badge>
											</TableCell>
											<TableCell className="hidden md:table-cell text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				<div className="flex justify-end gap-3">
					<Button variant="outline" asChild>
						<Link href="/admin/customers" className="gap-2">
							View Customers
							<ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
				</div>
			</div>
		</>
	)
}
