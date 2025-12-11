"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/lib/hooks/use-toast"
import { useTicket } from "@/lib/hooks/useTickets"
import { useMessages, useAddMessage } from "@/lib/hooks/useMessages"
import { Sparkles, Loader2, Clock, User } from 'lucide-react'
import { formatDistanceToNow } from "date-fns"
import { Timestamp } from "firebase/firestore"

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

export function TicketDetail({ ticketId }: { ticketId: string }) {
  const [reply, setReply] = useState("")
  const { toast } = useToast()
  
  const { ticket, loading: ticketLoading } = useTicket(ticketId)
  const { messages, loading: messagesLoading } = useMessages(ticketId)
  const { addMessage, adding } = useAddMessage(ticketId)

  const formatDate = (date: any) => {
    if (!date) return "Unknown"
    const dateObj = date instanceof Timestamp ? date.toDate() : new Date(date)
    return formatDistanceToNow(dateObj, { addSuffix: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reply.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply",
        variant: "destructive",
      })
      return
    }

    try {
      await addMessage(reply.trim())
      
      toast({
        title: "Success",
        description: "Message sent successfully",
      })
      
      setReply("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      })
    }
  }

  if (ticketLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Ticket not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Ticket Header */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold mb-2 text-balance">
                {ticket.subject}
              </h1>
              <p className="text-muted-foreground leading-relaxed">
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

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Created {formatDate(ticket.createdAt)}
            </div>
            {ticket.category && (
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {ticket.category}
              </div>
            )}
          </div>

          {ticket.tags && ticket.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ticket.tags.map((tag: string) => (
                <div
                  key={tag}
                  className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary text-foreground text-sm"
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No messages yet. Be the first to reply!
            </p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={message.role === 'agent' ? "bg-primary text-primary-foreground" : "bg-secondary"}>
                    {message.role === 'agent' ? <User className="w-4 h-4" /> : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{message.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed bg-secondary rounded-lg p-3">
                    {message.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Reply Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Add Reply</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Type your reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="bg-secondary border-border min-h-[120px]"
            />
            
            <div className="flex gap-2">
              <Button type="submit" disabled={adding} className="flex-1">
                {adding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reply"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
