"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Copy, Send, Loader2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMessageStore } from "@/lib/stores/messageStore"
import { useAI } from "@/lib/hooks/useAI"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface ConversationThreadProps {
  ticketId: string
}

export function ConversationThread({ ticketId }: ConversationThreadProps) {
  const { getMessages, loading, addMessage } = useMessageStore()
  const messages = getMessages(ticketId)
  const { suggestions, generating, generateSuggestions, clearSuggestions } = useAI(ticketId)
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [isUsingAI, setIsUsingAI] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  
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
  
  const handleUseSuggestion = (suggestion: string) => {
    setReplyText(suggestion)
    setIsUsingAI(true)
    setShowSuggestions(false)
    toast({ title: "AI suggestion loaded", description: "You can edit before sending" })
  }
  
  const handleSendReply = async () => {
    if (!replyText.trim() || !user) return
    
    setSendingReply(true)
    try {
      await addMessage(ticketId, {
        text: replyText,
        userId: user.uid,
        userName: user.displayName || user.email || 'Agent',
        role: 'agent',
        isAiSuggestion: isUsingAI,
      })
      
      setReplyText('')
      setIsUsingAI(false)
      setShowSuggestions(false)
      clearSuggestions()
      toast({ title: "Reply sent successfully" })
    } catch (error) {
      toast({ title: "Failed to send reply", variant: "destructive" })
    } finally {
      setSendingReply(false)
    }
  }
  
  const handleGenerateAI = async () => {
    setShowSuggestions(true)
    await generateSuggestions()
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
      
      {/* AI Suggestions Section */}
      {showSuggestions && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">AI Suggestions</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleGenerateAI}
                  disabled={generating}
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", generating && "animate-spin")} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSuggestions(false)}
                >
                  ×
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {generating && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Generating AI suggestions...</span>
              </div>
            )}
            
            {!generating && suggestions.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No suggestions available. Click refresh to try again.
              </div>
            )}
            
            {!generating && suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 transition-colors"
              >
                <p className="text-sm mb-3 text-foreground">{suggestion}</p>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full"
                  onClick={() => handleUseSuggestion(suggestion)}
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Use This Reply
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Reply Form */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Your Reply</label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateAI}
                disabled={generating || showSuggestions}
                className="gap-2"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Get AI Suggestions
              </Button>
            </div>
            <Textarea
              value={replyText}
              onChange={(e) => {
                setReplyText(e.target.value)
                if (isUsingAI && e.target.value !== replyText) {
                  setIsUsingAI(false)
                }
              }}
              placeholder="Type your response..."
              className="min-h-[120px] resize-none"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isUsingAI && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Suggestion
                </Badge>
              )}
            </div>
            <Button 
              onClick={handleSendReply} 
              disabled={!replyText.trim() || sendingReply}
              className="gap-2"
            >
              {sendingReply ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Reply
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
