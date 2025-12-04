import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Building, Calendar, Clock, Tag, Sparkles } from "lucide-react"

export function TicketInfo() {
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
              <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">john.doe@example.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="text-sm font-medium">Acme Corporation</p>
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
                <p className="text-sm font-medium">Nov 30, 2025 at 10:30 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">2 min ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Tag className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Tags</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    mobile
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    authentication
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    ios
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Categorization */}
      <Card className="border-2 border-[oklch(0.97_0.04_276.98)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[oklch(0.55_0.18_276.98)]" />
            <CardTitle className="text-base">AI Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Category</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-medium">Technical Support</p>
              <Badge className="ai-badge">94% confidence</Badge>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground">Sentiment</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-medium">Frustrated</p>
              <Badge className="ai-badge">88% confidence</Badge>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground">Suggested Priority</p>
            <div className="mt-1">
              <p className="text-sm font-medium text-orange-600">High</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
            Escalate to Senior Agent
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
            Request More Information
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
            Add Internal Note
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
