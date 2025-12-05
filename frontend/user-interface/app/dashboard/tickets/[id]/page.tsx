import { DashboardHeader } from "@/components/dashboard-header"
import { TicketDetail } from "@/components/ticket-detail"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to tickets
          </Link>
          
          <TicketDetail ticketId={params.id} />
        </div>
      </main>
    </div>
  )
}
