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
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border bg-background">
      <nav className="flex h-full flex-col gap-2 p-4">
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
