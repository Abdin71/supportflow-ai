"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { getStatusDistribution } from "@/lib/firebase/dashboard"

const COLORS = {
  open: "oklch(0.62 0.21 252.36)",
  "in-progress": "oklch(0.71 0.15 64.82)",
  pending: "oklch(0.55 0.18 276.98)",
  resolved: "oklch(0.43 0.12 264.05)",
  closed: "oklch(0.55 0.06 180)"
}

const priorityColors = {
  low: "oklch(0.43 0.12 264.05)",
  medium: "oklch(0.62 0.21 252.36)",
  high: "oklch(0.71 0.15 64.82)",
  urgent: "oklch(0.64 0.26 29.23)"
}

type ChartData = { name: string; value: number; color: string }

export function QuickStats() {
  const [statusData, setStatusData] = useState<ChartData[]>([])
  const [priorityData, setPriorityData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDistributions()
  }, [])

  const loadDistributions = async () => {
    try {
      const data = await getStatusDistribution()
      
      // Transform status distribution
      const statusChartData: ChartData[] = Object.entries(data.byStatus)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          name: status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          value: count,
          color: COLORS[status as keyof typeof COLORS]
        }))
      
      // Transform priority distribution
      const priorityChartData: ChartData[] = Object.entries(data.byPriority)
        .filter(([_, count]) => count > 0)
        .map(([priority, count]) => ({
          name: priority.charAt(0).toUpperCase() + priority.slice(1),
          value: count,
          color: priorityColors[priority as keyof typeof priorityColors]
        }))
      
      setStatusData(statusChartData)
      setPriorityData(priorityChartData)
    } catch (error) {
      console.error('Error loading distributions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tickets by Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tickets by Priority</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tickets by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px]">
              <p className="text-muted-foreground">No ticket data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tickets by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px]">
              <p className="text-muted-foreground">No priority data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
