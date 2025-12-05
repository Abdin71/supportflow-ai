"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TicketHeader } from "@/components/ticket-details/ticket-header"
import { ConversationThread } from "@/components/ticket-details/conversation-thread"
import { ReplyForm } from "@/components/ticket-details/reply-form"
import { TicketInfo } from "@/components/ticket-details/ticket-info"
import { Card, CardContent } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function TicketDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const [status, setStatus] = useState("open")

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <TicketHeader
            ticketId={params.id}
            subject="Login issue with mobile app - Cannot authenticate"
            status={status}
            onStatusChange={setStatus}
          />

          {/* Split Layout */}
          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
            {/* Left Panel - Conversation */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <ConversationThread />
                </CardContent>
              </Card>
              <ReplyForm />
            </div>

            {/* Right Panel - Ticket Info */}
            <div className="space-y-4">
              <TicketInfo />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
