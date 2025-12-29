"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ContentHeader } from "@/components/layout/content-header"
import { FilterBar } from "@/components/tickets/filter-bar"
import { TicketsTable } from "@/components/tickets/tickets-table"
import { CreateTicketModal } from "@/components/modals/create-ticket-modal"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useTicketStore } from "@/lib/stores/ticketStore"

export default function AssignedTicketsPage() {
  const [activeStatus, setActiveStatus] = useState("all")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)
  const { user } = useAuth()
  const { setFilters } = useTicketStore()

  // Filter to show only tickets assigned to current user
  useEffect(() => {
    if (user?.uid) {
      setFilters({ assignedTo: user.uid })
    }
    return () => {
      // Reset filters when leaving page
      setFilters({})
    }
  }, [user?.uid, setFilters])

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Content Header */}
          <ContentHeader
            title="Assigned to Me"
            description="Tickets currently assigned to your account"
            onNewTicket={() => setIsNewTicketOpen(true)}
          />

          {/* Filter Bar */}
          <FilterBar
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            category={category}
            onCategoryChange={setCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Tickets Table - filtered to show only assigned tickets */}
          <TicketsTable />
        </div>

        <CreateTicketModal open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen} />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
