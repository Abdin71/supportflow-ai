"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FilterBar } from "@/components/tickets/filter-bar"
import { TicketsTable } from "@/components/tickets/tickets-table"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AssignedTicketsPage() {
  const [activeStatus, setActiveStatus] = useState("all")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Assigned to Me</h1>
            <p className="mt-1 text-muted-foreground">Tickets currently assigned to your account</p>
          </div>

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
      </DashboardLayout>
    </ProtectedRoute>
  )
}
