"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface TeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: any
  onSuccess: () => void
}

export function TeamDialog({ open, onOpenChange, team, onSuccess }: TeamDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
  })

  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (open && team) {
      setFormData(team)
    } else if (open) {
      setFormData({ name: "", description: "", department: "" })
    }
  }, [open, team])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (team?.id) {
        const { error } = await supabase.from("maintenance_teams").update(formData).eq("id", team.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("maintenance_teams").insert([formData])
        if (error) throw error
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving team:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="glass w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">{team ? "Edit Team" : "New Team"}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Team Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mechanics, Electricians"
                className="glass-sm bg-white/5 border-white/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Team description"
                className="glass-sm bg-white/5 border-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Department</label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Production, IT"
                className="glass-sm bg-white/5 border-white/20"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 glass-sm bg-white/5 border-white/20"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500">
                {loading ? "Saving..." : "Save Team"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
