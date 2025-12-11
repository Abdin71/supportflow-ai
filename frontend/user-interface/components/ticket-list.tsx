"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MessageSquare, AlertCircle, Loader2 } from 'lucide-react'
import { useTickets } from "@/lib/hooks/useTickets"
import { formatDistanceToNow } from "date-fns"
import { Timestamp } from "firebase/firestore"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const statusColors = {
  open: "bg-[color:var(--warning)]/10 text-[color:var(--warning)] border-[color:var(--warning)]/20",
  "in-progress": "bg-primary/10 text-primary border-primary/20",
  resolved: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-[color:var(--success)]/20",
  closed: "bg-muted text-muted-foreground border-muted",
}

const statusLabels = {
  open: "Open",
  "in-progress": "In Progress",
  resolved: "Resolved",
  closed: "Closed",
}

export function TicketList() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { tickets, loading } = useTickets(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  )

  const formatDate = (date: any) => {
    if (!date) return "Unknown"
    const dateObj = date instanceof Timestamp ? date.toDate() : new Date(date)
    return formatDistanceToNow(dateObj, { addSuffix: true })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tickets</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tickets.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tickets found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create your first ticket to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
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
                        {formatDate(ticket.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {ticket.messageCount} {ticket.messageCount === 1 ? "message" : "messages"}
                      </div>
                      {ticket.category && (
                        <div className="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {ticket.category}
                        </div>
                      )}
                    </div>

                    {ticket.tags && ticket.tags.length > 0 && (
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
                    )}
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
