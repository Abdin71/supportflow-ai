"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const categoryData = [
  { name: "Technical", value: 42, color: "oklch(0.43 0.12 264.05)" },
  { name: "Billing", value: 28, color: "oklch(0.62 0.21 252.36)" },
  { name: "General", value: 18, color: "oklch(0.55 0.18 276.98)" },
  { name: "Feature Request", value: 12, color: "oklch(0.71 0.15 64.82)" },
]

const priorityData = [
  { name: "Low", value: 35, percentage: "35%" },
  { name: "Medium", value: 40, percentage: "40%" },
  { name: "High", value: 20, percentage: "20%" },
  { name: "Urgent", value: 5, percentage: "5%" },
]

export function QuickStats() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tickets by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Priority Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {priorityData.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{item.name}</span>
                <span className="text-muted-foreground">{item.percentage}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary transition-all" style={{ width: item.percentage }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
