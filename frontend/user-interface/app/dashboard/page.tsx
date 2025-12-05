import { DashboardHeader } from "@/components/dashboard-header"
import { TicketList } from "@/components/ticket-list"
import { Suspense } from "react"
import { TicketListSkeleton } from "@/components/ticket-list-skeleton"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Tickets</h1>
              <p className="text-muted-foreground mt-1">
                View and manage your support tickets
              </p>
            </div>
          </div>
          
          <Suspense fallback={<TicketListSkeleton />}>
            <TicketList />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
