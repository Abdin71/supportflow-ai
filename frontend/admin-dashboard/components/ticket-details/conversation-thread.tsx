"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sparkles, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

const messages = [
  {
    id: 1,
    type: "customer",
    author: "John Doe",
    avatar: "JD",
    content:
      "I've been trying to log into the mobile app for the past hour but keep getting an 'Authentication Failed' error. I've tried resetting my password twice but the issue persists.",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    type: "agent",
    author: "Sarah Chen",
    avatar: "SC",
    content:
      "Hi John, I'm sorry to hear you're experiencing login issues. Let me investigate this for you. Can you confirm which version of the mobile app you're using?",
    timestamp: "1 hour 45 min ago",
  },
  {
    id: 3,
    type: "customer",
    author: "John Doe",
    avatar: "JD",
    content: "I'm using version 2.4.1 on iOS 17.2.",
    timestamp: "1 hour 30 min ago",
  },
  {
    id: 4,
    type: "ai-suggestion",
    content:
      "Based on the error pattern and app version, this appears to be related to the OAuth token refresh issue identified in ticket T-1195. Suggest updating to version 2.4.2 which includes the authentication fix.",
    confidence: 92,
  },
]

export function ConversationThread() {
  return (
    <div className="space-y-4">
      {messages.map((message) => {
        if (message.type === "ai-suggestion") {
          return (
            <Card key={message.id} className="border-2 border-[oklch(0.97_0.04_276.98)] bg-[oklch(0.97_0.04_276.98)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[oklch(0.55_0.18_276.98)]" />
                    <span className="text-sm font-semibold text-[oklch(0.55_0.18_276.98)]">AI Suggested Reply</span>
                    <Badge className="ai-badge">{message.confidence}% confidence</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Copy className="h-3 w-3" />
                    Use This
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm leading-relaxed text-foreground">{message.content}</p>
              </CardContent>
            </Card>
          )
        }

        const isCustomer = message.type === "customer"
        return (
          <div key={message.id} className={cn("flex gap-3", !isCustomer && "flex-row-reverse text-right")}>
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback
                className={cn(isCustomer ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground")}
              >
                {message.avatar}
              </AvatarFallback>
            </Avatar>
            <div className={cn("flex-1 space-y-2", !isCustomer && "items-end")}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{message.author}</span>
                <span className="text-xs text-muted-foreground">{message.timestamp}</span>
              </div>
              <Card
                className={cn("inline-block max-w-[85%]", isCustomer ? "bg-card" : "bg-primary/5 border-primary/20")}
              >
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed text-foreground">{message.content}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      })}
    </div>
  )
}
