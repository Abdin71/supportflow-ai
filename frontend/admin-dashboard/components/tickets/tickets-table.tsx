"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, Reply, UserPlus, MoreVertical, AlertCircle, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const mockTickets = [
  {
    id: "T-1234",
    subject: "Login issue with mobile app - Cannot authenticate",
    status: "open",
    priority: "high",
    category: "Technical",
    assignedTo: "Unassigned",
    lastUpdate: "2 min ago",
    customer: "John Doe",
  },
  {
    id: "T-1233",
    subject: "Payment gateway not responding during checkout",
    status: "progress",
    priority: "urgent",
    category: "Billing",
    assignedTo: "Sarah Chen",
    lastUpdate: "15 min ago",
    customer: "Alice Smith",
  },
  {
    id: "T-1232",
    subject: "Feature request: Dark mode support",
    status: "open",
    priority: "low",
    category: "Feature Request",
    assignedTo: "Unassigned",
    lastUpdate: "1 hour ago",
    customer: "Bob Wilson",
  },
  {
    id: "T-1231",
    subject: "Cannot reset password via email",
    status: "resolved",
    priority: "medium",
    category: "Technical",
    assignedTo: "Mike Johnson",
    lastUpdate: "2 hours ago",
    customer: "Emma Davis",
  },
  {
    id: "T-1230",
    subject: "Data export not working for large files",
    status: "progress",
    priority: "high",
    category: "Technical",
    assignedTo: "Sarah Chen",
    lastUpdate: "3 hours ago",
    customer: "Chris Lee",
  },
  {
    id: "T-1229",
    subject: "Invoice missing from billing history",
    status: "open",
    priority: "medium",
    category: "Billing",
    assignedTo: "Unassigned",
    lastUpdate: "5 hours ago",
    customer: "Diana Prince",
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
  low: {
    label: "Low",
    icon: Circle,
    className: "text-muted-foreground",
  },
  medium: {
    label: "Medium",
    icon: Circle,
    className: "text-blue-600",
  },
  high: {
    label: "High",
    icon: AlertCircle,
    className: "text-orange-600",
  },
  urgent: {
    label: "Urgent",
    icon: AlertCircle,
    className: "text-[oklch(0.628_0.258_27.325)]",
  },
}

export function TicketsTable() {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])

  const toggleTicket = (ticketId: string) => {
    setSelectedTickets((prev) => (prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]))
  }

  const toggleAll = () => {
    if (selectedTickets.length === mockTickets.length) {
      setSelectedTickets([])
    } else {
      setSelectedTickets(mockTickets.map((t) => t.id))
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox checked={selectedTickets.length === mockTickets.length} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead className="w-[100px]">Ticket ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="w-[130px]">Status</TableHead>
              <TableHead className="w-[130px]">Priority</TableHead>
              <TableHead className="w-[130px]">Category</TableHead>
              <TableHead className="w-[130px]">Assigned To</TableHead>
              <TableHead className="w-[120px]">Last Update</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTickets.map((ticket) => {
              const PriorityIcon = priorityConfig[ticket.priority as keyof typeof priorityConfig].icon
              return (
                <TableRow key={ticket.id} className={cn(selectedTickets.includes(ticket.id) && "bg-muted/50")}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTickets.includes(ticket.id)}
                      onCheckedChange={() => toggleTicket(ticket.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm font-medium">{ticket.id}</TableCell>
                  <TableCell>
                    <Link href={`/tickets/${ticket.id}`} className="font-medium hover:text-primary hover:underline">
                      {ticket.subject}
                    </Link>
                    <div className="mt-0.5 text-xs text-muted-foreground">{ticket.customer}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn("status-badge", statusConfig[ticket.status as keyof typeof statusConfig].className)}
                    >
                      {statusConfig[ticket.status as keyof typeof statusConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 text-sm font-medium",
                        priorityConfig[ticket.priority as keyof typeof priorityConfig].className,
                      )}
                    >
                      <PriorityIcon className="h-4 w-4" />
                      {priorityConfig[ticket.priority as keyof typeof priorityConfig].label}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{ticket.category}</TableCell>
                  <TableCell className="text-sm">
                    {ticket.assignedTo === "Unassigned" ? (
                      <span className="text-muted-foreground">{ticket.assignedTo}</span>
                    ) : (
                      ticket.assignedTo
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ticket.lastUpdate}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Assign to Me
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/tickets/${ticket.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Reply className="mr-2 h-4 w-4" />
                          Quick Reply
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
