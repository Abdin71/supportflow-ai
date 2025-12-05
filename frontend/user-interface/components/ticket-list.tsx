"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MessageSquare, AlertCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const mockTickets = [
  {
    id: "1",
    subject: "Password reset not working",
    description: "I'm unable to reset my password using the forgot password link",
    status: "open",
    category: "Account & Login",
    tags: ["password", "authentication", "urgent"],
    createdAt: "2024-01-15T10:30:00Z",
    replies: 2,
  },
  {
    id: "2",
    subject: "Feature request: Dark mode",
    description: "Would love to see a dark mode option in the settings",
    status: "in-progress",
    category: "Feature Request",
    tags: ["enhancement", "ui"],
    createdAt: "2024-01-14T14:20:00Z",
    replies: 1,
  },
  {
    id: "3",
    subject: "Payment declined error",
    description: "Getting an error when trying to process payment",
    status: "resolved",
    category: "Billing & Payment",
    tags: ["payment", "billing", "resolved"],
    createdAt: "2024-01-13T09:15:00Z",
    replies: 5,
  },
]

const statusColors = {
  open: "bg-[color:var(--warning)]/10 text-[color:var(--warning)] border-[color:var(--warning)]/20",
  "in-progress": "bg-primary/10 text-primary border-primary/20",
  resolved: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-[color:var(--success)]/20",
}

const statusLabels = {
  open: "Open",
  "in-progress": "In Progress",
  resolved: "Resolved",
}

export function TicketList() {
  const [filter, setFilter] = useState<string>("all")

  const filteredTickets = filter === "all" 
    ? mockTickets 
    : mockTickets.filter(ticket => ticket.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tickets</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTickets.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tickets found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
              <Card className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 truncate">
                          {ticket.subject}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={statusColors[ticket.status as keyof typeof statusColors]}
                      >
                        {statusLabels[ticket.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {ticket.replies} {ticket.replies === 1 ? "reply" : "replies"}
                      </div>
                      <div className="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {ticket.category}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {ticket.tags.map((tag) => (
                        <div
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-secondary text-foreground"
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
