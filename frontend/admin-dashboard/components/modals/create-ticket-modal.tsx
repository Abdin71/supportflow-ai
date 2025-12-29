"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Circle, Sparkles } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getUsers } from "@/lib/firebase/tickets"
import { useTicketStore } from "@/lib/stores/ticketStore"
import { useToast } from "@/hooks/use-toast"

interface CreateTicketModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTicketModal({ open, onOpenChange }: CreateTicketModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<Array<{ uid: string; email: string; displayName?: string }>>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const { createTicket } = useTicketStore()
  
  const [formData, setFormData] = useState({
    customer: "",
    subject: "",
    description: "",
    priority: "medium" as 'low' | 'medium' | 'high' | 'urgent',
    category: "",
    assignToMe: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Load users when modal opens
  useEffect(() => {
    if (open) {
      setLoadingUsers(true)
      getUsers().then(usersList => {
        setUsers(usersList)
        setLoadingUsers(false)
      })
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.customer) newErrors.customer = "Customer is required"
    if (!formData.subject) newErrors.subject = "Subject is required"
    if (!formData.description) newErrors.description = "Description is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    
    try {
      const selectedUser = users.find(u => u.uid === formData.customer)
      if (!selectedUser) {
        throw new Error('Selected user not found')
      }
      
      await createTicket({
        subject: formData.subject,
        description: formData.description,
        userId: selectedUser.uid,
        userEmail: selectedUser.email,
        userName: selectedUser.displayName || selectedUser.email,
        priority: formData.priority,
        category: formData.category || undefined,
        assignedTo: formData.assignToMe ? user?.uid : undefined
      })
      
      toast({
        title: "Ticket created successfully",
        description: "The ticket has been added to the system"
      })
      
      onOpenChange(false)
      
      // Reset form
      setFormData({
        customer: "",
        subject: "",
        description: "",
        priority: "medium",
        category: "",
        assignToMe: false,
      })
      setErrors({})
    } catch (error) {
      console.error('Error creating ticket:', error)
      toast({
        title: "Failed to create ticket",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const priorityConfig = {
    low: { label: "Low", icon: Circle, className: "text-muted-foreground" },
    medium: { label: "Medium", icon: Circle, className: "text-blue-600" },
    high: { label: "High", icon: AlertCircle, className: "text-orange-600" },
    urgent: {
      label: "Urgent",
      icon: AlertCircle,
      className: "text-[oklch(0.628_0.258_27.325)]",
    },
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Ticket</DialogTitle>
          <DialogDescription>Add a new customer support ticket to the system</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer">
              Customer <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={formData.customer} 
              onValueChange={(value) => setFormData({ ...formData, customer: value })}
              disabled={loadingUsers}
            >
              <SelectTrigger id="customer" className={errors.customer ? "border-destructive" : ""}>
                <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select a customer"} />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.uid} value={user.uid}>
                    {user.displayName || user.email} - {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customer && <p className="text-xs text-destructive">{errors.customer}</p>}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Brief description of the issue"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className={errors.subject ? "border-destructive" : ""}
            />
            {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Detailed description of the issue..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`min-h-[120px] ${errors.description ? "border-destructive" : ""}`}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          {/* Priority and Category Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">
                Priority <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as 'low' | 'medium' | 'high' | 'urgent' })}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityConfig).map(([value, config]) => {
                    const Icon = config.icon
                    return (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${config.className}`} />
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Auto-categorize" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assign to Me Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="assignToMe"
              checked={formData.assignToMe}
              onCheckedChange={(checked) => setFormData({ ...formData, assignToMe: checked as boolean })}
            />
            <Label
              htmlFor="assignToMe"
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Assign this ticket to me
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Creating..." : "Create Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
