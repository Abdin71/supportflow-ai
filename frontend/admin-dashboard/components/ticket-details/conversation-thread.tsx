"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sparkles, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMessageStore } from "@/lib/stores/messageStore"
import { formatDistanceToNow } from "date-fns"

interface ConversationThreadProps {
  ticketId: string
}

export function ConversationThread({ ticketId }: ConversationThreadProps) {
  const { getMessages, loading } = useMessageStore()
  const messages = getMessages(ticketId)
  
  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Just now'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return 'Just now'
    }
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  if (loading[ticketId]) {
    return <div className="text-center text-muted-foreground py-8">Loading messages...</div>
  }
  
  if (messages.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No messages yet.</div>
  }
  return (
    <div className="space-y-4">
      {messages.map((message) => {
        // Show AI suggestion badge if applicable
        if (message.isAiSuggestion) {
          return (
            <Card key={message.id} className="border-2 border-[oklch(0.97_0.04_276.98)] bg-[oklch(0.97_0.04_276.98)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[oklch(0.55_0.18_276.98)]" />
                    <span className="text-sm font-semibold text-[oklch(0.55_0.18_276.98)]">AI Generated Reply</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm leading-relaxed text-foreground">{message.text}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{message.userName}</span>
                  <span>•</span>
                  <span>{formatTime(message.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          )
        }

        const isCustomer = message.role === "user"
        return (
          <div key={message.id} className={cn("flex gap-3", !isCustomer && "flex-row-reverse text-right")}>
            <Avatar className="h-10 w-10">
              <AvatarFallback
                className={cn(isCustomer ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground")}
              >
                {getInitials(message.userName)}
              </AvatarFallback>
            </Avatar>
            <div className={cn("flex-1 space-y-2", !isCustomer && "items-end")}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{message.userName}</span>
                <span className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</span>
                {message.isEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
              </div>
              <Card
                className={cn("inline-block max-w-[85%]", isCustomer ? "bg-card" : "bg-primary/5 border-primary/20")}
              >
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{message.text}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      })}
    </div>
  )
}
