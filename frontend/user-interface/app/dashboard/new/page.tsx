import { DashboardHeader } from "@/components/dashboard-header"
import { NewTicketForm } from "@/components/new-ticket-form"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"

export default function NewTicketPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to tickets
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Ticket</h1>
            <p className="text-muted-foreground mt-1">
              Describe your issue and our AI will help categorize it
            </p>
          </div>
          
          <NewTicketForm />
        </div>
      </main>
    </div>
  )
}
