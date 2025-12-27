"use client"

import { Package, Edit2, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Equipment {
  id: string
  name: string
  serial_number: string
  location: string
  status: string
  category?: { name: string }
  team?: { name: string }
  assigned?: { full_name: string }
}

export default function EquipmentList({
  equipment,
  onEdit,
}: {
  equipment: Equipment[]
  onEdit: (item: Equipment) => void
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "inactive":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "scrapped":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {equipment.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No equipment found</p>
        </div>
      ) : (
        equipment.map((item) => (
          <Card key={item.id} className="glass glass-hover group overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">SN: {item.serial_number}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="text-foreground">{item.category?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team:</span>
                  <span className="text-foreground">{item.team?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="text-foreground">{item.location || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned to:</span>
                  <span className="text-foreground">{item.assigned?.full_name || "Unassigned"}</span>
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(item)}
                  className="flex-1 glass-sm bg-white/5 border-white/20"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 glass-sm bg-white/5 border-white/20">
                  <Zap className="w-4 h-4 mr-1" />
                  Maintenance
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
