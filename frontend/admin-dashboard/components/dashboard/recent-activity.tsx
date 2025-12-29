"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Reply, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { getRecentActivity } from "@/lib/firebase/dashboard"
import type { Ticket } from "@/lib/firebase/types"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

const statusConfig = {
  open: {
    label: "Open",
    className: "bg-[oklch(0.98_0.05_78.75)] text-[oklch(0.71_0.15_64.82)]",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-[oklch(0.96_0.04_252.36)] text-[oklch(0.62_0.21_252.36)]",
  },
  pending: {
    label: "Pending",
    className: "bg-[oklch(0.98_0.05_78.75)] text-[oklch(0.71_0.15_64.82)]",
  },
  resolved: {
    label: "Resolved",
    className: "bg-[oklch(0.97_0.04_163.23)] text-[oklch(0.64_0.18_163.23)]",
  },
  closed: {
    label: "Closed",
    className: "bg-gray-100 text-gray-600",
  },
}

const priorityConfig = {
  low: { label: "Low", className: "text-muted-foreground" },
  medium: { label: "Medium", className: "text-blue-600" },
  high: { label: "High", className: "text-orange-600" },
  urgent: {
    label: "Urgent",
    className: "text-[oklch(0.628_0.258_27.325)] font-semibold",
  },
}

export function RecentActivity() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadActivity = async () => {
      const recentTickets = await getRecentActivity(5)
      setTickets(recentTickets)
      setLoading(false)
    }
    
    loadActivity()
  }, [])
  
  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Just now'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return 'Just now'
    }
  }
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center text-muted-foreground">
          Loading recent activity...
        </CardContent>
      </Card>
    )
  }
  
  if (tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center text-muted-foreground">
          No recent activity to display
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
      <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
      <Table>
        <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Ticket ID</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead className="w-[120px]">Status</TableHead>
          <TableHead className="w-[100px]">Priority</TableHead>
          <TableHead className="w-[120px]">Last Update</TableHead>
          <TableHead className="w-[150px] text-right">Actions</TableHead>
        </TableRow>
        </TableHeader>
        <TableBody>
        {tickets.map((ticket) => {
          const priority = ticket.priority || 'medium'
          const status = statusConfig[ticket.status] || statusConfig['open']
          
          return (
          <TableRow 
            key={ticket.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => window.location.href = `/tickets/${ticket.id}`}
          >
            <TableCell className="font-mono text-sm font-medium">
            {ticket.id.substring(0, 8)}
            </TableCell>
            <TableCell className="font-medium">{ticket.subject}</TableCell>
            <TableCell>
            <Badge className={cn("status-badge", status.className)}>
              {status.label}
            </Badge>
            </TableCell>
            <TableCell>
            <span className={cn("text-sm font-medium", priorityConfig[priority].className)}>
              {priorityConfig[priority].label}
            </span>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
            {formatTime(ticket.updatedAt)}
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-end gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
              <Link href={`/tickets/${ticket.id}`}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Link>
              </Button>
            </div>
            </TableCell>
          </TableRow>
          )
        })}
        </TableBody>
      </Table>
      </CardContent>
    </Card>
  )
}
