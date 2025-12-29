"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ContentHeader } from "@/components/layout/content-header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Shield, Loader2 } from "lucide-react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useToast } from "@/hooks/use-toast"
import { updateProfile } from "firebase/auth"
import { auth } from "@/lib/firebase/config"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [saving, setSaving] = useState(false)
  
  const handleSaveChanges = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName
        })
      }
      
      // Update Firestore user document
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        displayName: displayName
      })
      
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully"
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Update failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <ContentHeader title="Settings" description="Manage your account and preferences" />

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback className="text-lg">
                    {user?.displayName?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="displayName"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" defaultValue={user?.email || ""} disabled className="pl-9 bg-muted" />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="role" defaultValue={user?.role || "agent"} disabled className="pl-9 bg-muted capitalize" />
                </div>
                <p className="text-xs text-muted-foreground">Contact admin to change role</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveChanges} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setDisplayName(user?.displayName || "")} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Firestore Integration Info */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
              <CardDescription>Firebase Authentication integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground">✅ Connected to Firebase</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your account is authenticated via Firebase. Profile updates are synced with Firestore.
                </p>
                <div className="mt-3 text-xs text-muted-foreground">
                  <p><strong>User ID:</strong> {user?.uid}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Role:</strong> {user?.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
