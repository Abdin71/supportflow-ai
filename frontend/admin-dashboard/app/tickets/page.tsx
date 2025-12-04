"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FilterBar } from "@/components/tickets/filter-bar"
import { TicketsTable } from "@/components/tickets/tickets-table"

export default function TicketsPage() {
  const [activeStatus, setActiveStatus] = useState("all")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">All Tickets</h1>
          <p className="mt-1 text-muted-foreground">View and manage customer support tickets</p>
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

        {/* Tickets Table */}
        <TicketsTable />
      </div>
    </DashboardLayout>
  )
}
