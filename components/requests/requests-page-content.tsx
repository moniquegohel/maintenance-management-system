"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { KanbanBoard } from "@/components/requests/kanban-board"
import { RequestDialog } from "@/components/requests/request-dialog"

export default function RequestsPageContent() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase.from("maintenance_requests").select(`
        *,
        equipment:equipment(name, serial_number),
        team:maintenance_teams(name),
        assigned:profiles(full_name, avatar_url),
        creator:created_by(full_name)
      `)

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = requests.filter(
    (req) =>
      req.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.equipment?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Maintenance Requests</h1>
            <p className="text-muted-foreground mt-2">Track and manage maintenance work</p>
          </div>
          <Button
            onClick={() => {
              setSelectedRequest(null)
              setShowDialog(true)
            }}
            className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search requests by subject or equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-sm pl-10 bg-white/5 border-white/20"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading requests...</div>
      ) : (
        <KanbanBoard
          requests={filteredRequests}
          onEdit={(req) => {
            setSelectedRequest(req)
            setShowDialog(true)
          }}
          onRefresh={fetchRequests}
        />
      )}

      <RequestDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        request={selectedRequest}
        onSuccess={fetchRequests}
      />
    </div>
  )
}
