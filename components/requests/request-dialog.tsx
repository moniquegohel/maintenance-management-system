"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface RequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: any
  onSuccess: () => void
}

export function RequestDialog({ open, onOpenChange, request, onSuccess }: RequestDialogProps) {
  const [formData, setFormData] = useState({
    subject: "",
    equipment_id: "",
    type: "corrective",
    priority: "normal",
    stage: "new",
    description: "",
    scheduled_date: "",
    duration_hours: "",
    assigned_to: "",
  })

  const [equipment, setEquipment] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchOptions()
      if (request) {
        setFormData(request)
      } else {
        setFormData({
          subject: "",
          equipment_id: "",
          type: "corrective",
          priority: "normal",
          stage: "new",
          description: "",
          scheduled_date: "",
          duration_hours: "",
          assigned_to: "",
        })
      }
    }
  }, [open, request])

  const fetchOptions = async () => {
    try {
      const [{ data: equip }, { data: prof }] = await Promise.all([
        supabase.from("equipment").select("id, name, serial_number"),
        supabase.from("profiles").select("id, full_name"),
      ])
      setEquipment(equip || [])
      setProfiles(prof || [])
    } catch (error) {
      console.error("Error fetching options:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await supabase.auth.getUser()

      const requestData = {
        ...formData,
        created_by: user.data.user?.id,
      }

      if (request?.id) {
        const { error } = await supabase.from("maintenance_requests").update(requestData).eq("id", request.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("maintenance_requests").insert([requestData])
        if (error) throw error
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving request:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {request ? "Edit Request" : "New Maintenance Request"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Subject</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="What needs to be fixed?"
                  className="glass-sm bg-white/5 border-white/20"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Equipment</label>
                <Select
                  value={formData.equipment_id}
                  onValueChange={(val) => setFormData({ ...formData, equipment_id: val })}
                >
                  <SelectTrigger className="glass-sm bg-white/5 border-white/20">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.name} (SN: {eq.serial_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                  <SelectTrigger className="glass-sm bg-white/5 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="preventive">Preventive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
                <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                  <SelectTrigger className="glass-sm bg-white/5 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Assigned To</label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(val) => setFormData({ ...formData, assigned_to: val })}
                >
                  <SelectTrigger className="glass-sm bg-white/5 border-white/20">
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Scheduled Date</label>
                <Input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="glass-sm bg-white/5 border-white/20"
                />
              </div>

              {request && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Duration (hours)</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    placeholder="0"
                    className="glass-sm bg-white/5 border-white/20"
                  />
                </div>
              )}

              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the issue..."
                  className="glass-sm bg-white/5 border-white/20 min-h-24"
                />
              </div>
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
                {loading ? "Saving..." : "Save Request"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
