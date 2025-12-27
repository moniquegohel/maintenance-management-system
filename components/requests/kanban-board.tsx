"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Trash2, GripVertical } from "lucide-react"

const STAGES = ["new", "in_progress", "repaired", "scrap"]
const STAGE_LABELS = {
  new: "New",
  in_progress: "In Progress",
  repaired: "Repaired",
  scrap: "Scrap",
}

const STAGE_COLORS = {
  new: "bg-blue-500/20 border-blue-500/30",
  in_progress: "bg-yellow-500/20 border-yellow-500/30",
  repaired: "bg-green-500/20 border-green-500/30",
  scrap: "bg-red-500/20 border-red-500/30",
}

interface KanbanBoardProps {
  requests: any[]
  onEdit: (req: any) => void
  onRefresh: () => void
}

export function KanbanBoard({ requests, onEdit, onRefresh }: KanbanBoardProps) {
  const [draggedItem, setDraggedItem] = useState<any>(null)
  const supabase = createClient()

  const handleDragStart = (e: React.DragEvent, request: any) => {
    setDraggedItem(request)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault()
    if (!draggedItem) return

    try {
      const { error } = await supabase.from("maintenance_requests").update({ stage: newStage }).eq("id", draggedItem.id)

      if (error) throw error

      // Log to history
      await supabase.from("maintenance_request_history").insert([
        {
          request_id: draggedItem.id,
          old_stage: draggedItem.stage,
          new_stage: newStage,
          changed_by: (await supabase.auth.getUser()).data.user?.id,
        },
      ])

      onRefresh()
    } catch (error) {
      console.error("Error updating request:", error)
    } finally {
      setDraggedItem(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this request?")) {
      try {
        const { error } = await supabase.from("maintenance_requests").delete().eq("id", id)
        if (error) throw error
        onRefresh()
      } catch (error) {
        console.error("Error deleting request:", error)
      }
    }
  }

  const getRequestsForStage = (stage: string) => requests.filter((req) => req.stage === stage)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-400"
      case "high":
        return "text-orange-400"
      case "normal":
        return "text-blue-400"
      case "low":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {STAGES.map((stage) => {
        const stageRequests = getRequestsForStage(stage)

        return (
          <div
            key={stage}
            className="glass glass-hover rounded-lg p-4 min-h-[500px] border border-white/20"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <div className="mb-4">
              <h3 className="font-semibold text-foreground text-lg">
                {STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}
              </h3>
              <p className="text-sm text-muted-foreground">{stageRequests.length} items</p>
            </div>

            <div className="space-y-3">
              {stageRequests.map((request) => (
                <Card
                  key={request.id}
                  className={`glass-sm group cursor-move border ${STAGE_COLORS[stage as keyof typeof STAGE_COLORS]}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, request)}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm line-clamp-2">{request.subject}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{request.equipment?.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`px-2 py-1 rounded font-medium ${
                          request.type === "corrective" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {request.type}
                      </span>
                      <span className={`font-medium ${getPriorityColor(request.priority)}`}>{request.priority}</span>
                    </div>

                    {request.is_overdue && (
                      <div className="flex items-center gap-1 text-xs text-red-400">
                        <AlertCircle className="w-3 h-3" />
                        Overdue
                      </div>
                    )}

                    {request.assigned?.full_name && (
                      <div className="text-xs text-muted-foreground">Assigned to: {request.assigned.full_name}</div>
                    )}

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(request)}
                        className="flex-1 glass-sm bg-white/5 border-white/20 h-8"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(request.id)}
                        className="glass-sm bg-white/5 border-white/20 h-8 px-2"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
