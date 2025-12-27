"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download } from "lucide-react"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("equipment-by-team")
  const [reportData, setReportData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    generateReport(reportType)
  }, [reportType])

  const generateReport = async (type: string) => {
    setLoading(true)
    try {
      let data: any[] = []

      if (type === "equipment-by-team") {
        const { data: teams } = await supabase.from("maintenance_teams").select("id, name")
        const teamEquipment = await Promise.all(
          (teams || []).map(async (team) => {
            const { data: equip } = await supabase.from("equipment").select("id").eq("maintenance_team_id", team.id)
            return {
              name: team.name,
              count: equip?.length || 0,
            }
          }),
        )
        data = teamEquipment
      } else if (type === "requests-by-team") {
        const { data: teams } = await supabase.from("maintenance_teams").select("id, name")
        const teamRequests = await Promise.all(
          (teams || []).map(async (team) => {
            const { data: reqs } = await supabase.from("maintenance_requests").select("id").eq("team_id", team.id)
            return {
              name: team.name,
              requests: reqs?.length || 0,
            }
          }),
        )
        data = teamRequests
      } else if (type === "equipment-status") {
        const { data: equip } = await supabase.from("equipment").select("status")
        const status: { [key: string]: number } = {}
        equip?.forEach((e) => {
          status[e.status] = (status[e.status] || 0) + 1
        })
        data = Object.entries(status).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        }))
      } else if (type === "request-completion") {
        const { data: reqs } = await supabase.from("maintenance_requests").select("*")
        const monthlyData: { [key: string]: { completed: number; total: number } } = {}

        reqs?.forEach((req) => {
          const month = new Date(req.created_at).toLocaleString("default", { month: "short" })
          if (!monthlyData[month]) {
            monthlyData[month] = { completed: 0, total: 0 }
          }
          monthlyData[month].total++
          if (req.stage === "repaired") {
            monthlyData[month].completed++
          }
        })

        data = Object.entries(monthlyData).map(([month, { completed, total }]) => ({
          month,
          completed,
          remaining: total - completed,
          total,
        }))
      }

      setReportData(data)
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const csv = [["Report Type", reportType], [], ...reportData.map((item) => Object.values(item))]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `report-${reportType}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-2">Analytics and insights for your maintenance operations</p>
      </div>

      <Card className="glass p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">Select Report</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="glass-sm bg-white/5 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equipment-by-team">Equipment by Team</SelectItem>
                <SelectItem value="requests-by-team">Requests by Team</SelectItem>
                <SelectItem value="equipment-status">Equipment Status Distribution</SelectItem>
                <SelectItem value="request-completion">Request Completion Trends</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleExport}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Generating report...</div>
        ) : reportData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            {(reportType === "equipment-status" || reportType === "requests-by-team") &&
            reportType !== "equipment-by-team" ? (
              <BarChart data={reportData}>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey={reportType === "requests-by-team" ? "name" : "name"} stroke="rgba(255,255,255,0.3)" />
                <YAxis stroke="rgba(255,255,255,0.3)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30, 30, 46, 0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                {reportType === "requests-by-team" ? (
                  <Bar dataKey="requests" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                ) : (
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                )}
              </BarChart>
            ) : (
              <LineChart data={reportData}>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey={reportType === "request-completion" ? "month" : "name"}
                  stroke="rgba(255,255,255,0.3)"
                />
                <YAxis stroke="rgba(255,255,255,0.3)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30, 30, 46, 0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                {reportType === "request-completion" ? (
                  <>
                    <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="remaining" stroke="#ef4444" strokeWidth={2} />
                  </>
                ) : (
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <p className="text-center py-12 text-muted-foreground">No data available for this report</p>
        )}
      </Card>

      {/* Data Table */}
      {reportData.length > 0 && (
        <Card className="glass p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-foreground mb-4">Report Data</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                {Object.keys(reportData[0]).map((key) => (
                  <th key={key} className="px-4 py-2 text-left text-muted-foreground font-semibold">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, idx) => (
                <tr key={idx} className="border-b border-white/10">
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="px-4 py-2 text-foreground">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
