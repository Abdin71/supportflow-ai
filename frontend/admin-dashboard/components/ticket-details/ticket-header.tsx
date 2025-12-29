"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useTicketStore } from "@/lib/stores/ticketStore"
import { useAuth } from "@/lib/auth-context"
import type { Ticket } from "@/lib/firebase/types"
import { useToast } from "@/hooks/use-toast"

interface TicketHeaderProps {
  ticket: Ticket
}

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

export function TicketHeader({ ticket }: TicketHeaderProps) {
  const { updateStatus, assignToAgent } = useTicketStore()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus(ticket.id, newStatus as Ticket['status'])
      toast({ title: "Status updated successfully" })
    } catch (error) {
      toast({ title: "Failed to update status", variant: "destructive" })
    }
  }
  
  const handleAssignToMe = async () => {
    if (!user) return
    try {
      await assignToAgent(ticket.id, user.uid)
      toast({ title: "Ticket assigned to you" })
    } catch (error) {
      toast({ title: "Failed to assign ticket", variant: "destructive" })
    }
  }
  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/tickets" className="flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Link>
      </div>

      {/* Ticket Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-muted-foreground">
              #{ticket.id.substring(0, 8)}
            </span>
            <Badge className={cn("status-badge", statusConfig[ticket.status].className)}>
              {statusConfig[ticket.status].label}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{ticket.subject}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Select value={ticket.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2" onClick={handleAssignToMe} disabled={ticket.assignedTo === user?.uid}>
            <UserPlus className="h-4 w-4" />
            {ticket.assignedTo === user?.uid ? 'Assigned to You' : 'Assign to Me'}
          </Button>
        </div>
      </div>
    </div>
  )
}
