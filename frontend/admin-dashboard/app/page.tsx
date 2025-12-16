"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ContentHeader } from "@/components/layout/content-header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { CreateTicketModal } from "@/components/modals/create-ticket-modal"
import { Inbox, UserCheck, Clock, TrendingUp } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DashboardPage() {
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)

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
              value={24}
              subtitle="from last week"
              trend={{ value: 12, isPositive: false }}
              icon={Inbox}
              iconColor="text-[oklch(0.71_0.15_64.82)]"
            />
            <MetricCard
              title="Assigned to Me"
              value={8}
              subtitle="requiring action"
              icon={UserCheck}
              iconColor="text-[oklch(0.62_0.21_252.36)]"
            />
            <MetricCard
              title="Avg Response Time"
              value="23m"
              subtitle="from last week"
              trend={{ value: 18, isPositive: true }}
              icon={Clock}
              iconColor="text-[oklch(0.64_0.18_163.23)]"
            />
            <MetricCard
              title="Resolution Rate"
              value="87%"
              subtitle="from last week"
              trend={{ value: 5, isPositive: true }}
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
