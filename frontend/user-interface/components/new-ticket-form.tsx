"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/lib/hooks/use-toast"
import { useCreateTicket } from "@/lib/hooks/useTickets"
import { useTicket } from "@/lib/hooks/useTickets"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Loader2, Sparkles } from 'lucide-react'

export function NewTicketForm() {
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { createTicket, creating } = useCreateTicket()
  const { ticket: aiTicket } = useTicket(createdTicketId)

  // Watch for AI analysis completion
  useEffect(() => {
    if (aiTicket && aiTicket.aiMetadata.processingStatus === 'completed') {
      toast({
        title: "AI Analysis Complete",
        description: `Category: ${aiTicket.category}, Priority: ${aiTicket.priority}`,
      })
    }
  }, [aiTicket?.aiMetadata.processingStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject || !description) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    try {
      const ticketId = await createTicket({
        subject,
        description,
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || 'Anonymous',
      })
      
      setCreatedTicketId(ticketId)
      
      toast({
        title: "Success",
        description: "Ticket created successfully. AI is analyzing...",
      })
      
      // Redirect after a short delay to see AI analysis
      setTimeout(() => {
        router.push(`/dashboard`)
      }, 2000)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={creating}
                className="bg-secondary border-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={creating}
                className="bg-secondary border-border min-h-[200px]"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={creating} className="flex-1">
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating & Analyzing with AI...
                  </>
                ) : (
                  "Create Ticket"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {aiTicket && aiTicket.aiMetadata.processingStatus !== 'pending' && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              {aiTicket.aiMetadata.processingStatus === 'processing' && 'AI Analyzing...'}
              {aiTicket.aiMetadata.processingStatus === 'completed' && 'AI Analysis Complete'}
              {aiTicket.aiMetadata.processingStatus === 'failed' && 'AI Analysis Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiTicket.aiMetadata.processingStatus === 'completed' && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {aiTicket.category || 'General Inquiry'}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Priority</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {aiTicket.priority || 'medium'}
                  </div>
                </div>
                {aiTicket.tags && aiTicket.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {aiTicket.tags.map((tag) => (
                        <div
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary text-foreground text-sm"
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {aiTicket.aiMetadata.processingStatus === 'processing' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing your ticket with AI...
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
