"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, Reply, UserPlus, MoreVertical, AlertCircle, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useTicketStore } from "@/lib/stores/ticketStore"
import { useAuth } from "@/lib/auth-context"
import type { Ticket } from "@/lib/firebase/types"
import { formatDistanceToNow } from "date-fns"
import { AIStatusBadge } from "@/components/ui/ai-status-badge"

interface TicketsTableProps {
  searchQuery?: string;
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

export function TicketsTable({ searchQuery = "" }: TicketsTableProps) {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const { loading, updateStatus, getFilteredAndSortedTickets } = useTicketStore()
  const { user } = useAuth()
  
  // Get pre-filtered and sorted tickets from store
  const tickets = getFilteredAndSortedTickets()
  
  // Apply search filter on top of store filters
  const filteredTickets = useMemo(() => {
    if (!searchQuery) return tickets
    
    const query = searchQuery.toLowerCase()
    return tickets.filter(ticket => 
      ticket.subject.toLowerCase().includes(query) ||
      ticket.userEmail.toLowerCase().includes(query) ||
      ticket.userName.toLowerCase().includes(query)
    )
  }, [tickets, searchQuery])
  
  // Format timestamp to relative time
  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return 'N/A'
    }
  }

  const toggleTicket = (ticketId: string) => {
    setSelectedTickets((prev) => (prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]))
  }

  const toggleAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([])
    } else {
      setSelectedTickets(filteredTickets.map((t) => t.id))
    }
  }
  
  const handleStatusUpdate = async (ticketId: string, newStatus: Ticket['status']) => {
    try {
      await updateStatus(ticketId, newStatus)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }
  
  if (loading && tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground"
>
          Loading tickets...
        </CardContent>
      </Card>
    )
  }
  
  if (filteredTickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          {searchQuery ? 'No tickets found matching your search.' : 'No tickets available.'}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead className="w-[100px]">Ticket ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="w-[130px]">Status</TableHead>
              <TableHead className="w-[130px]">Category</TableHead>
              <TableHead className="w-[120px]">Priority</TableHead>
              <TableHead className="w-[110px]">AI Status</TableHead>
              <TableHead className="w-[100px]">Messages</TableHead>
              <TableHead className="w-[120px]">Last Update</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => {
              const priority = ticket.priority || 'medium'
              const PriorityIcon = priorityConfig[priority].icon
              const status = statusConfig[ticket.status] || statusConfig['open']
              
              return (
                <TableRow key={ticket.id} className={cn(selectedTickets.includes(ticket.id) && "bg-muted/50")}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTickets.includes(ticket.id)}
                      onCheckedChange={() => toggleTicket(ticket.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm font-medium">
                    {ticket.id.substring(0, 8)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/tickets/${ticket.id}`} className="font-medium hover:text-primary hover:underline">
                      {ticket.subject}
                    </Link>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {ticket.userName} ({ticket.userEmail})
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={cn("status-badge cursor-pointer", status.className)}>
                          {status.label}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(ticket.id, 'open')}>
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(ticket.id, 'in-progress')}>
                          In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(ticket.id, 'pending')}>
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(ticket.id, 'resolved')}>
                          Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(ticket.id, 'closed')}>
                          Closed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    {ticket.category ? (
                      <Badge variant="outline" className="text-xs">
                        {ticket.category}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 text-sm font-medium",
                        priorityConfig[priority].className,
                      )}
                    >
                      <PriorityIcon className="h-4 w-4" />
                      {priorityConfig[priority].label}
                    </div>
                  </TableCell>
                  <TableCell>
                    {ticket.aiMetadata?.processingStatus ? (
                      <AIStatusBadge 
                        status={ticket.aiMetadata.processingStatus} 
                        size="sm"
                      />
                    ) : (
                      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                        No AI
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{ticket.messageCount || 0}</span>
                      {ticket.hasUnreadMessages && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" title="Unread messages" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTime(ticket.updatedAt)}
                  </TableCell>
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
