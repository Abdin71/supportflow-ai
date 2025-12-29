"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Sparkles } from "lucide-react"
import { useTicketStore } from "@/lib/stores/ticketStore"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface ReplyFormProps {
  ticketId: string
}

export function ReplyForm({ ticketId }: ReplyFormProps) {
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const { reply } = useTicketStore()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !user) return
    
    setSending(true)
    try {
      await reply(ticketId, message.trim(), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      })
      setMessage("")
      toast({ title: "Reply sent successfully" })
    } catch (error) {
      toast({ title: "Failed to send reply", variant: "destructive" })
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="sticky bottom-0 border-t border-border bg-background p-4">
      <div className="space-y-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your reply..."
          className="min-h-[100px] resize-none"
        />
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" size="sm" className="gap-2 bg-transparent" disabled>
            <Sparkles className="h-4 w-4" />
            Generate AI Reply
          </Button>
          <Button type="submit" size="sm" className="gap-2" disabled={!message.trim() || sending}>
            <Send className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send Reply'}
          </Button>
        </div>
      </div>
    </form>
  )
}
