"use client"

import type { ReactNode } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: ReactNode
  onNewTicket?: () => void
}

export function DashboardLayout({ children, onNewTicket }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header onNewTicket={onNewTicket} />
      <Sidebar />
      <main className="ml-64 min-h-[calc(100vh-4rem)] bg-secondary/30 p-8">{children}</main>
    </div>
  )
}
