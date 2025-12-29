"use client"

import { use, useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ContentHeader } from "@/components/layout/content-header"
import { TicketHeader } from "@/components/ticket-details/ticket-header"
import { ConversationThread } from "@/components/ticket-details/conversation-thread"
import { ReplyForm } from "@/components/ticket-details/reply-form"
import { TicketInfo } from "@/components/ticket-details/ticket-info"
import { Card, CardContent } from "@/components/ui/card"
import { CreateTicketModal } from "@/components/modals/create-ticket-modal"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useMessageStore } from "@/lib/stores/messageStore"
import { getTicket, markTicketAsRead } from "@/lib/firebase/tickets"
import type { Ticket } from "@/lib/firebase/types"

export default function TicketDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)
  const { subscribeToTicket, unsubscribeFromTicket } = useMessageStore()

  // Load ticket and subscribe to messages
  useEffect(() => {
    const loadTicket = async () => {
      try {
        const ticketData = await getTicket(id)
        setTicket(ticketData)
        setLoading(false)
        
        // Mark as read
        if (ticketData) {
          await markTicketAsRead(id)
        }
      } catch (error) {
        console.error('Error loading ticket:', error)
        setLoading(false)
      }
    }
    
    loadTicket()
    subscribeToTicket(id)
    
    return () => {
      unsubscribeFromTicket(id)
    }
  }, [id, subscribeToTicket, unsubscribeFromTicket])
  
  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-muted-foreground">Loading ticket...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }
  
  if (!ticket) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-muted-foreground">Ticket not found</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <ContentHeader
            title={`Ticket #${id.substring(0, 8)}`}
            description={ticket.subject}
            onNewTicket={() => setIsNewTicketOpen(true)}
          />

          <TicketHeader ticket={ticket} />

          {/* Split Layout */}
          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
            {/* Left Panel - Conversation */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <ConversationThread ticketId={id} />
                </CardContent>
              </Card>
              <ReplyForm ticketId={id} />
            </div>

            {/* Right Panel - Ticket Info */}
            <div className="space-y-4">
              <TicketInfo ticket={ticket} />
            </div>
          </div>
        </div>

        <CreateTicketModal open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen} />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
