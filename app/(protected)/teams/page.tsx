"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { TeamsList } from "@/components/teams/teams-list"
import { TeamDialog } from "@/components/teams/team-dialog"

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase.from("maintenance_teams").select(`
        *
      `)

      if (error) throw error
      setTeams(data || [])
    } catch (error) {
      console.error("Error fetching teams:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Teams</h1>
            <p className="text-muted-foreground mt-2">Manage maintenance teams and members</p>
          </div>
          <Button
            onClick={() => {
              setSelectedTeam(null)
              setShowDialog(true)
            }}
            className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Team
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-sm pl-10 bg-white/5 border-white/20"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading teams...</div>
      ) : (
        <TeamsList
          teams={filteredTeams}
          onEdit={(team) => {
            setSelectedTeam(team)
            setShowDialog(true)
          }}
          onRefresh={fetchTeams}
        />
      )}

      <TeamDialog open={showDialog} onOpenChange={setShowDialog} team={selectedTeam} onSuccess={fetchTeams} />
    </div>
  )
}
