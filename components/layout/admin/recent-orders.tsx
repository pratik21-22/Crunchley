"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowRight } from "lucide-react"

const orders = [
  {
    id: "ORD-001",
    customer: "Priya Sharma",
    email: "priya@example.com",
    product: "Cheese Makhana",
    amount: "₹458",
    status: "delivered",
    date: "2 hours ago",
  },
  {
    id: "ORD-002",
    customer: "Rahul Verma",
    email: "rahul@example.com",
    product: "Peri Peri Makhana",
    amount: "₹687",
    status: "processing",
    date: "4 hours ago",
  },
  {
    id: "ORD-003",
    customer: "Anita Patel",
    email: "anita@example.com",
    product: "Classic Makhana",
    amount: "₹398",
    status: "shipped",
    date: "6 hours ago",
  },
  {
    id: "ORD-004",
    customer: "Vikram Singh",
    email: "vikram@example.com",
    product: "Pudina Makhana",
    amount: "₹876",
    status: "pending",
    date: "8 hours ago",
  },
  {
    id: "ORD-005",
    customer: "Sneha Reddy",
    email: "sneha@example.com",
    product: "Tomato Makhana",
    amount: "₹543",
    status: "delivered",
    date: "1 day ago",
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-700 border-green-200"
    case "shipped":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "processing":
      return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "pending":
      return "bg-gray-100 text-gray-700 border-gray-200"
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

export function RecentOrders() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders" className="gap-1">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.customer}</p>
                    <p className="text-sm text-muted-foreground hidden sm:block">
                      {order.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {order.product}
                </TableCell>
                <TableCell className="font-medium">{order.amount}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusColor(order.status)}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {order.date}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
