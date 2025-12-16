"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Inbox, UserCheck, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  {
    name: "Dashboard Overview",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "All Tickets",
    href: "/tickets",
    icon: Inbox,
    badge: 24,
  },
  {
    name: "Assigned to Me",
    href: "/assigned",
    icon: UserCheck,
    badge: 8,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background">
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-none text-foreground">SupportFlow AI</h1>
          <p className="text-xs text-muted-foreground">Customer Support</p>
        </div>
      </div>

      <nav className="flex h-[calc(100vh-4rem)] flex-col gap-2 p-4">
        <div className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start gap-3", isActive && "bg-secondary font-medium")}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge !== null && (
                    <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary hover:bg-primary/20">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            )
          })}
        </div>

        {/* Bottom-aligned Settings */}
        <Link href="/settings">
          <Button
            variant={pathname === "/settings" ? "secondary" : "ghost"}
            className={cn("w-full justify-start gap-3", pathname === "/settings" && "bg-secondary font-medium")}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </Link>
      </nav>
    </aside>
  )
}
