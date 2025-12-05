"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, Loader2, Clock, User } from 'lucide-react'

const mockTicket = {
  id: "1",
  subject: "Password reset not working",
  description: "I'm unable to reset my password using the forgot password link. I've tried multiple times but I'm not receiving the reset email. Can you help me with this issue?",
  status: "open",
  category: "Account & Login",
  tags: ["password", "authentication", "urgent"],
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T14:20:00Z",
  replies: [
    {
      id: "1",
      user: "Support Agent",
      message: "Thank you for reaching out. I'll help you resolve this issue. Can you confirm the email address you're using?",
      timestamp: "2024-01-15T11:00:00Z",
      isAgent: true,
    },
    {
      id: "2",
      user: "You",
      message: "Yes, it's user@example.com",
      timestamp: "2024-01-15T11:15:00Z",
      isAgent: false,
    },
  ],
}

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

export function TicketDetail({ ticketId }: { ticketId: string }) {
  const [reply, setReply] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerateSuggestion = async () => {
    setIsGenerating(true)
    
    // Simulate AI generating suggestion
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setAiSuggestion("I've checked your account and I can see the password reset emails were blocked by your email provider. I've manually sent a new reset link to your email address. Please check your inbox (and spam folder) and let me know if you receive it.")
    setIsGenerating(false)
  }

  const handleUseAiSuggestion = () => {
    if (aiSuggestion) {
      setReply(aiSuggestion)
      setAiSuggestion(null)
    }
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

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast({
      title: "Success",
      description: "Reply sent successfully",
    })
    
    setReply("")
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Ticket Header */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold mb-2 text-balance">
                {mockTicket.subject}
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                {mockTicket.description}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={statusColors[mockTicket.status as keyof typeof statusColors]}
            >
              {statusLabels[mockTicket.status as keyof typeof statusLabels]}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Created {new Date(mockTicket.createdAt).toLocaleString()}
            </div>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {mockTicket.category}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {mockTicket.tags.map((tag) => (
              <div
                key={tag}
                className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary text-foreground text-sm"
              >
                {tag}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockTicket.replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className={reply.isAgent ? "bg-primary text-primary-foreground" : "bg-secondary"}>
                  {reply.isAgent ? <User className="w-4 h-4" /> : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{reply.user}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(reply.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed bg-secondary rounded-lg p-3">
                  {reply.message}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Suggested Reply
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed">{aiSuggestion}</p>
            <div className="flex gap-2">
              <Button onClick={handleUseAiSuggestion} size="sm">
                Use this reply
              </Button>
              <Button onClick={() => setAiSuggestion(null)} variant="outline" size="sm">
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              disabled={isSubmitting}
              className="bg-secondary border-border min-h-[120px]"
            />
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateSuggestion}
                disabled={isGenerating || isSubmitting}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    AI Suggest
                  </>
                )}
              </Button>
              
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
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
