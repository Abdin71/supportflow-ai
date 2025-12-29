import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Building, Calendar, Clock, Tag, Sparkles, User } from "lucide-react"
import type { Ticket } from "@/lib/firebase/types"
import { formatDistanceToNow, format } from "date-fns"

interface TicketInfoProps {
  ticket: Ticket
}

export function TicketInfo({ ticket }: TicketInfoProps) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return format(date, 'MMM d, yyyy \'at\' h:mm a')
    } catch (error) {
      return 'N/A'
    }
  }
  
  const formatRelative = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return 'N/A'
    }
  }
  return (
    <div className="space-y-4">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{ticket.userName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{ticket.userEmail}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ticket Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">{formatDate(ticket.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">{formatRelative(ticket.updatedAt)}</p>
              </div>
            </div>
            {ticket.category && (
              <div className="flex items-start gap-3">
                <Tag className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {ticket.category}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Metadata if available */}
      {ticket.aiMetadata && (
        <Card className="border-2 border-[oklch(0.97_0.04_276.98)]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[oklch(0.55_0.18_276.98)]" />
              <CardTitle className="text-base">AI Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Processing Status</p>
              <p className="text-sm font-medium capitalize mt-1">{ticket.aiMetadata.processingStatus}</p>
            </div>
            {ticket.aiMetadata.category && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">AI Category</p>
                  <p className="text-sm font-medium mt-1">{ticket.aiMetadata.category}</p>
                </div>
              </>
            )}
            {ticket.aiMetadata.suggestedPriority && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Suggested Priority</p>
                  <p className="text-sm font-medium capitalize mt-1">{ticket.aiMetadata.suggestedPriority}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
