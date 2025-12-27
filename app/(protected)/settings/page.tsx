"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ full_name: "", department: "" })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push("/auth/login")
        return
      }

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

      setProfile(profileData)
      setFormData({
        full_name: profileData?.full_name || "",
        department: profileData?.department || "",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const { error } = await supabase.from("profiles").update(formData).eq("id", userData.user?.id)

      if (error) throw error
      await fetchProfile()
      setEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your profile and preferences</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading settings...</div>
      ) : (
        <div className="space-y-6">
          {/* Profile Information */}
          <Card className="glass p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{profile?.full_name || "User"}</h2>
                <p className="text-muted-foreground">{profile?.email}</p>
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="glass-sm bg-white/5 border-white/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Department</label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="glass-sm bg-white/5 border-white/20"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateProfile} className="bg-gradient-to-r from-blue-500 to-purple-500">
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                    className="glass-sm bg-white/5 border-white/20"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="text-foreground font-medium">{profile?.full_name || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="text-foreground font-medium">{profile?.department || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="text-foreground font-medium capitalize">{profile?.role || "Technician"}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setEditing(true)}
                  className="mt-4 glass-sm bg-white/5 border-white/20"
                >
                  Edit Profile
                </Button>
              </div>
            )}
          </Card>

          {/* Account Actions */}
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Account</h3>
            <Button
              onClick={handleLogout}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </Card>

          {/* System Information */}
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">System Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Application</span>
                <span className="text-foreground">GearGuard v1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="text-foreground">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
