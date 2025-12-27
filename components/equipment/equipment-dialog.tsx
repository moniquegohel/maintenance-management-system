"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EquipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment: any
  onSuccess: () => void
}

export function EquipmentDialog({ open, onOpenChange, equipment, onSuccess }: EquipmentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    serial_number: "",
    category_id: "",
    department: "",
    location: "",
    maintenance_team_id: "",
    purchase_date: "",
    warranty_expiry: "",
    status: "active",
  })

  const [categories, setCategories] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchOptions()
      if (equipment) {
        setFormData(equipment)
      }
    }
  }, [open, equipment])

  const fetchOptions = async () => {
    try {
      const [{ data: cats }, { data: tms }] = await Promise.all([
        supabase.from("equipment_categories").select("*"),
        supabase.from("maintenance_teams").select("*"),
      ])
      setCategories(cats || [])
      setTeams(tms || [])
    } catch (error) {
      console.error("Error fetching options:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (equipment?.id) {
        const { error } = await supabase.from("equipment").update(formData).eq("id", equipment.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("equipment").insert([formData])
        if (error) throw error
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving equipment:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="glass w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">{equipment ? "Edit Equipment" : "New Equipment"}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Equipment name"
                className="glass-sm bg-white/5 border-white/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Serial Number</label>
              <Input
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                placeholder="SN-12345"
                className="glass-sm bg-white/5 border-white/20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <Select
                  value={formData.category_id}
                  onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                >
                  <SelectTrigger className="glass-sm bg-white/5 border-white/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Team</label>
                <Select
                  value={formData.maintenance_team_id}
                  onValueChange={(val) => setFormData({ ...formData, maintenance_team_id: val })}
                >
                  <SelectTrigger className="glass-sm bg-white/5 border-white/20">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Department</label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Production, IT, etc."
                className="glass-sm bg-white/5 border-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Building A, Floor 2, etc."
                className="glass-sm bg-white/5 border-white/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Purchase Date</label>
                <Input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="glass-sm bg-white/5 border-white/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Warranty Expiry</label>
                <Input
                  type="date"
                  value={formData.warranty_expiry}
                  onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                  className="glass-sm bg-white/5 border-white/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                <SelectTrigger className="glass-sm bg-white/5 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="scrapped">Scrapped</SelectItem>
                </SelectContent>
              </Select>
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
                {loading ? "Saving..." : "Save Equipment"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
