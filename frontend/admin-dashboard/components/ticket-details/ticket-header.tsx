"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, UserPlus, Tag } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useTicketStore } from "@/lib/stores/ticketStore"
import { useAuth } from "@/lib/auth-context"
import type { Ticket } from "@/lib/firebase/types"
import { useToast } from "@/hooks/use-toast"
import { AIStatusBadge } from "@/components/ui/ai-status-badge"

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

const priorityConfig = {
  low: {
    label: "Low",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  high: {
    label: "High",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  urgent: {
    label: "Urgent",
    className: "bg-red-100 text-red-700 border-red-200",
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
          
          {/* AI Metadata Section */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {/* AI Status Badge */}
            {ticket.aiMetadata?.processingStatus && (
              <AIStatusBadge 
                status={ticket.aiMetadata.processingStatus}
                confidence={ticket.aiMetadata.completedAt ? (ticket as any).aiMetadata?.confidence : undefined}
                showConfidence={ticket.aiMetadata.processingStatus === 'completed'}
                size="sm"
              />
            )}
            
            {/* AI Category */}
            {ticket.category && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {ticket.category}
              </Badge>
            )}
            
            {/* AI Priority */}
            {ticket.priority && (
              <Badge 
                variant="outline" 
                className={priorityConfig[ticket.priority]?.className || priorityConfig.medium.className}
              >
                {priorityConfig[ticket.priority]?.label || 'Medium'}
              </Badge>
            )}
            
            {/* AI Tags */}
            {(ticket as any).tags && Array.isArray((ticket as any).tags) && (ticket as any).tags.length > 0 && (
              <>
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                {(ticket as any).tags.slice(0, 3).map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {(ticket as any).tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{(ticket as any).tags.length - 3} more
                  </span>
                )}
              </>
            )}
          </div>
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
