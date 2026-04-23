"use client"

import { Card, CardContent } from "@/components/ui/card"
import { 
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  IndianRupee,
  Users,
  Package
} from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
  {
    title: "Total Orders",
    value: "1,284",
    change: "+12.5%",
    trend: "up",
    icon: ShoppingCart,
    description: "vs last month",
  },
  {
    title: "Revenue",
    value: "₹2,45,890",
    change: "+8.2%",
    trend: "up",
    icon: IndianRupee,
    description: "vs last month",
  },
  {
    title: "Total Users",
    value: "3,456",
    change: "+23.1%",
    trend: "up",
    icon: Users,
    description: "vs last month",
  },
  {
    title: "Products",
    value: "48",
    change: "-2.4%",
    trend: "down",
    icon: Package,
    description: "active products",
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-0 shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-sm">
              {stat.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={cn(
                  "font-medium",
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                )}
              >
                {stat.change}
              </span>
              <span className="text-muted-foreground">{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
