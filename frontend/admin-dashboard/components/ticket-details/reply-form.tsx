"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Sparkles } from "lucide-react"

export function ReplyForm() {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Sending message:", message)
    setMessage("")
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
          <Button type="button" variant="outline" size="sm" className="gap-2 bg-transparent">
            <Sparkles className="h-4 w-4" />
            Generate AI Reply
          </Button>
          <Button type="submit" size="sm" className="gap-2">
            <Send className="h-4 w-4" />
            Send Reply
          </Button>
        </div>
      </div>
    </form>
  )
}
