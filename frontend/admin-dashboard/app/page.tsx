"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ContentHeader } from "@/components/layout/content-header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { CreateTicketModal } from "@/components/modals/create-ticket-modal"
import { Inbox, UserCheck, Clock, TrendingUp } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/lib/auth-context"
import { subscribeToDashboardStats } from "@/lib/firebase/dashboard"
import type { DashboardStats } from "@/lib/firebase/dashboard"

export default function DashboardPage() {
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    openTickets: 0,
    assignedToMe: 0,
    totalTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: '0m',
    resolutionRate: '0%'
  })
  const [loading, setLoading] = useState(true)
  
  // Subscribe to dashboard stats
  useEffect(() => {
    if (!user) return
    
    const unsubscribe = subscribeToDashboardStats((newStats) => {
      setStats(newStats)
      setLoading(false)
    }, user.uid)
    
    return () => unsubscribe()
  }, [user])

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Content Header */}
          <ContentHeader
            title="Dashboard Overview"
            description="Monitor your support metrics and recent activity"
            onNewTicket={() => setIsNewTicketOpen(true)}
          />

          {/* Metric Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Open Tickets"
              value={loading ? '-' : stats.openTickets}
              subtitle="requiring attention"
              icon={Inbox}
              iconColor="text-[oklch(0.71_0.15_64.82)]"
            />
            <MetricCard
              title="Assigned to Me"
              value={loading ? '-' : stats.assignedToMe}
              subtitle="requiring action"
              icon={UserCheck}
              iconColor="text-[oklch(0.62_0.21_252.36)]"
            />
            <MetricCard
              title="Avg Response Time"
              value={loading ? '-' : stats.avgResponseTime}
              subtitle="from creation"
              icon={Clock}
              iconColor="text-[oklch(0.64_0.18_163.23)]"
            />
            <MetricCard
              title="Resolution Rate"
              value={loading ? '-' : stats.resolutionRate}
              subtitle="closed or resolved"
              icon={TrendingUp}
              iconColor="text-primary"
            />
          </div>

          {/* Recent Activity */}
          <RecentActivity />

          {/* Quick Stats */}
          <QuickStats />
        </div>

        <CreateTicketModal open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen} />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
