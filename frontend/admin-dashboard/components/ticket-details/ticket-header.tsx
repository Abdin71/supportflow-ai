"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface TicketHeaderProps {
  ticketId: string
  subject: string
  status: string
  onStatusChange: (status: string) => void
}

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

export function TicketHeader({ ticketId, subject, status, onStatusChange }: TicketHeaderProps) {
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
            <span className="font-mono text-sm font-semibold text-muted-foreground">{ticketId}</span>
            <Badge className={cn("status-badge", statusConfig[status as keyof typeof statusConfig].className)}>
              {statusConfig[status as keyof typeof statusConfig].label}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{subject}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Assign to Me
          </Button>
        </div>
      </div>
    </div>
  )
}
