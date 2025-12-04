"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Reply, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"

const recentTickets = [
  {
    id: "T-1234",
    subject: "Login issue with mobile app",
    status: "open",
    priority: "high",
    lastUpdate: "2 min ago",
  },
  {
    id: "T-1233",
    subject: "Payment gateway not responding",
    status: "progress",
    priority: "urgent",
    lastUpdate: "15 min ago",
  },
  {
    id: "T-1232",
    subject: "Feature request: Dark mode",
    status: "open",
    priority: "low",
    lastUpdate: "1 hour ago",
  },
  {
    id: "T-1231",
    subject: "Cannot reset password",
    status: "resolved",
    priority: "medium",
    lastUpdate: "2 hours ago",
  },
  {
    id: "T-1230",
    subject: "Data export not working",
    status: "progress",
    priority: "high",
    lastUpdate: "3 hours ago",
  },
]

const statusConfig = {
  open: {
    label: "Open",
    className: "bg-[oklch(0.98_0.05_78.75)] text-[oklch(0.71_0.15_64.82)]",
  },
  progress: {
    label: "In Progress",
    className: "bg-[oklch(0.96_0.04_252.36)] text-[oklch(0.62_0.21_252.36)]",
  },
  resolved: {
    label: "Resolved",
    className: "bg-[oklch(0.97_0.04_163.23)] text-[oklch(0.64_0.18_163.23)]",
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
              <TableHead className="w-[200px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-mono text-sm font-medium">{ticket.id}</TableCell>
                <TableCell className="font-medium">{ticket.subject}</TableCell>
                <TableCell>
                  <Badge
                    className={cn("status-badge", statusConfig[ticket.status as keyof typeof statusConfig].className)}
                  >
                    {statusConfig[ticket.status as keyof typeof statusConfig].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      priorityConfig[ticket.priority as keyof typeof priorityConfig].className,
                    )}
                  >
                    {priorityConfig[ticket.priority as keyof typeof priorityConfig].label}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{ticket.lastUpdate}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <UserPlus className="h-4 w-4" />
                      <span className="sr-only">Assign</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Reply className="h-4 w-4" />
                      <span className="sr-only">Reply</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
