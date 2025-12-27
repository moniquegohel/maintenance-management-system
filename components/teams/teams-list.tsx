"use client"

import { Users, Edit2, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface Team {
  id: string
  name: string
  description: string
  department: string
}

export function TeamsList({
  teams,
  onEdit,
  onRefresh,
}: {
  teams: Team[]
  onEdit: (team: Team) => void
  onRefresh: () => void
}) {
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this team?")) {
      try {
        const { error } = await supabase.from("maintenance_teams").delete().eq("id", id)
        if (error) throw error
        onRefresh()
      } catch (error) {
        console.error("Error deleting team:", error)
      }
    }
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {teams.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No teams found</p>
        </div>
      ) : (
        teams.map((team) => (
          <Card key={team.id} className="glass glass-hover group overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">{team.name}</h3>
              {team.description && <p className="text-sm text-muted-foreground mb-3">{team.description}</p>}
              <div className="mb-4">
                <span className="text-xs font-medium text-muted-foreground">Department:</span>
                <p className="text-foreground">{team.department || "General"}</p>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(team)}
                  className="flex-1 glass-sm bg-white/5 border-white/20"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(team.id)}
                  className="flex-1 glass-sm bg-white/5 border-white/20 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
