"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ContentHeader } from "@/components/layout/content-header"
import { FilterBar } from "@/components/tickets/filter-bar"
import { TicketsTable } from "@/components/tickets/tickets-table"
import { CreateTicketModal } from "@/components/modals/create-ticket-modal"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useTicketStore } from "@/lib/stores/ticketStore"

export default function TicketsPage() {
  const [activeStatus, setActiveStatus] = useState("all")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)
  
  const { initialize, cleanup, setFilters, setSortBy: setStoreSortBy } = useTicketStore()
  
  // Initialize store on mount
  useEffect(() => {
    initialize()
    return () => cleanup()
  }, [initialize, cleanup])
  
  // Update filters when status or category changes
  useEffect(() => {
    setFilters({ 
      status: activeStatus,
      category: category !== 'all' ? category : undefined
    })
  }, [activeStatus, category, setFilters])
  
  // Update sort
  useEffect(() => {
    setStoreSortBy(sortBy as any)
  }, [sortBy, setStoreSortBy])

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Content Header */}
          <ContentHeader
            title="All Tickets"
            description="View and manage customer support tickets"
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

          {/* Tickets Table */}
          <TicketsTable searchQuery={searchQuery} />
        </div>

        <CreateTicketModal open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen} />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
