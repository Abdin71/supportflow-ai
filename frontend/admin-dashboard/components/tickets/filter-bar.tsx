"use client"
import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTicketStore } from "@/lib/stores/ticketStore"

interface FilterBarProps {
  activeStatus: string
  onStatusChange: (status: string) => void
  category: string
  onCategoryChange: (category: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function FilterBar({
  activeStatus,
  onStatusChange,
  category,
  onCategoryChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  const { tickets } = useTicketStore()
  
  // Calculate status counts from real data
  const statusCounts = useMemo(() => {
    return {
      all: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      'in-progress': tickets.filter(t => t.status === 'in-progress').length,
      pending: tickets.filter(t => t.status === 'pending').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
    }
  }, [tickets])
  
  const statusTabs = [
    { value: "all", label: "All", count: statusCounts.all },
    { value: "open", label: "Open", count: statusCounts.open },
    { value: "in-progress", label: "In Progress", count: statusCounts['in-progress'] },
    { value: "resolved", label: "Resolved", count: statusCounts.resolved },
  ]
  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onStatusChange(tab.value)}
            className={cn(
              "relative flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              activeStatus === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            <Badge
              variant="secondary"
              className={cn("text-xs", activeStatus === tab.value && "bg-primary/10 text-primary")}
            >
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="feature">Feature Request</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
