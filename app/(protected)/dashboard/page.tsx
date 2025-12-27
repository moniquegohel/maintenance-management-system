"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { AlertCircle, Wrench, CheckCircle, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    completedRequests: 0,
    overdueRequests: 0,
    totalEquipment: 0,
    activeEquipment: 0,
    totalTeams: 0,
  })

  const [requestsByTeam, setRequestsByTeam] = useState<any[]>([])
  const [requestsByType, setRequestsByType] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch requests stats
      const { data: requests } = await supabase.from("maintenance_requests").select("*")
      const { data: equipment } = await supabase.from("equipment").select("*")
      const { data: teams } = await supabase.from("maintenance_teams").select("*")

      const active = requests?.filter((r) => r.stage === "in_progress").length || 0
      const completed = requests?.filter((r) => r.stage === "repaired").length || 0
      const overdue = requests?.filter((r) => r.is_overdue).length || 0
      const activeEquip = equipment?.filter((e) => e.status === "active").length || 0

      // Calculate requests by team
      const teamCounts: { [key: string]: number } = {}
      requests?.forEach((req) => {
        const teamId = req.team_id || "unassigned"
        teamCounts[teamId] = (teamCounts[teamId] || 0) + 1
      })

      const teamData = await Promise.all(
        Object.entries(teamCounts).map(async ([teamId, count]) => {
          const { data: teamData } = await supabase.from("maintenance_teams").select("name").eq("id", teamId).single()
          return {
            name: teamData?.name || "Unassigned",
            value: count,
          }
        }),
      )

      // Calculate requests by type
      const typeCounts = {
        corrective: requests?.filter((r) => r.type === "corrective").length || 0,
        preventive: requests?.filter((r) => r.type === "preventive").length || 0,
      }

      setStats({
        totalRequests: requests?.length || 0,
        activeRequests: active,
        completedRequests: completed,
        overdueRequests: overdue,
        totalEquipment: equipment?.length || 0,
        activeEquipment: activeEquip,
        totalTeams: teams?.length || 0,
      })

      setRequestsByTeam(teamData)
      setRequestsByType([
        { name: "Corrective", value: typeCounts.corrective },
        { name: "Preventive", value: typeCounts.preventive },
      ])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"]

  const StatCard = ({ icon: Icon, label, value, trend }: any) => (
    <Card className="glass glass-hover p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
          <Icon className="w-6 h-6 text-purple-400" />
        </div>
      </div>
      {trend && <p className="text-xs text-green-400 mt-2">{trend}</p>}
    </Card>
  )

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Maintenance system overview and analytics</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading dashboard...</div>
      ) : (
        <>
          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Wrench} label="Total Requests" value={stats.totalRequests} />
            <StatCard icon={TrendingUp} label="Active Requests" value={stats.activeRequests} />
            <StatCard icon={CheckCircle} label="Completed" value={stats.completedRequests} />
            <StatCard icon={AlertCircle} label="Overdue" value={stats.overdueRequests} trend="Requires attention" />
          </div>

          {/* Equipment & Teams Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass glass-hover p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Total Equipment</h3>
              <p className="text-3xl font-bold text-foreground">{stats.totalEquipment}</p>
              <p className="text-xs text-green-400 mt-2">{stats.activeEquipment} active</p>
            </Card>
            <Card className="glass glass-hover p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Maintenance Teams</h3>
              <p className="text-3xl font-bold text-foreground">{stats.totalTeams}</p>
            </Card>
            <Card className="glass glass-hover p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Request Types</h3>
              <div className="space-y-1 text-sm">
                <p className="text-foreground">
                  Corrective: <span className="font-bold text-red-400">{requestsByType[0]?.value || 0}</span>
                </p>
                <p className="text-foreground">
                  Preventive: <span className="font-bold text-blue-400">{requestsByType[1]?.value || 0}</span>
                </p>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Requests by Team */}
            <Card className="glass p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Requests by Team</h3>
              {requestsByTeam.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={requestsByTeam}>
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                    <YAxis stroke="rgba(255,255,255,0.3)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(30, 30, 46, 0.8)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              )}
            </Card>

            {/* Request Types Distribution */}
            <Card className="glass p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Request Types</h3>
              {requestsByType.some((r) => r.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={requestsByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {requestsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(30, 30, 46, 0.8)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              )}
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/20">
                <span className="text-foreground">Overdue Requests</span>
                <span className={`font-bold ${stats.overdueRequests > 0 ? "text-red-400" : "text-green-400"}`}>
                  {stats.overdueRequests} {stats.overdueRequests > 0 ? "⚠️" : "✓"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/20">
                <span className="text-foreground">Equipment Health</span>
                <span className="font-bold text-green-400">
                  {Math.round(((stats.activeEquipment || 0) / (stats.totalEquipment || 1)) * 100)}% Active
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/20">
                <span className="text-foreground">Team Utilization</span>
                <span className="font-bold text-blue-400">
                  {stats.totalTeams > 0 ? `${stats.totalTeams} Teams Active` : "No Teams"}
                </span>
              </div>
            </div>
          </Card>

          {/* Calendar Route Link */}
          <div className="mt-6">
            <Link href="/calendar" className="text-blue-500 hover:underline">
              Go to Calendar
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
