"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CalendarProps {
  currentMonth: Date
  requests: any[]
}

export function Calendar({ currentMonth, requests }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateString = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getRequestsForDate = (date: Date) => {
    const dateStr = formatDateString(date)
    return requests.filter(
      (req) =>
        req.type === "preventive" &&
        req.scheduled_date &&
        req.scheduled_date.startsWith(dateStr) &&
        req.stage !== "scrap",
    )
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" })

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <div className="space-y-6">
      <Card className="glass overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">{monthName}</h2>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-semibold text-muted-foreground text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square" />
              }

              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const dayRequests = getRequestsForDate(date)
              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square glass-sm glass-hover border-2 rounded-lg p-2 cursor-pointer transition-all duration-300 flex flex-col ${
                    selectedDate?.toDateString() === date.toDateString()
                      ? "border-purple-500 bg-purple-500/20"
                      : isToday
                        ? "border-blue-500 bg-blue-500/20"
                        : "border-white/20 bg-white/5"
                  }`}
                >
                  <span className={`text-sm font-semibold ${isToday ? "text-blue-400" : "text-foreground"}`}>
                    {day}
                  </span>
                  {dayRequests.length > 0 && (
                    <div className="mt-1 space-y-1">
                      <Badge
                        variant="outline"
                        className="text-xs bg-orange-500/30 text-orange-300 border-orange-500/50"
                      >
                        {dayRequests.length} task{dayRequests.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Selected day details */}
      {selectedDate && (
        <Card className="glass p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            {selectedDate.toLocaleDateString("default", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>

          <div className="space-y-3">
            {getRequestsForDate(selectedDate).length > 0 ? (
              getRequestsForDate(selectedDate).map((req) => (
                <div key={req.id} className="glass-sm p-4 rounded-lg border border-white/20">
                  <h4 className="font-semibold text-foreground">{req.subject}</h4>
                  <p className="text-sm text-muted-foreground">{req.equipment?.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                      {req.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`${
                        req.stage === "in_progress"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : req.stage === "repaired"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-gray-500/20 text-gray-300"
                      } border-white/20`}
                    >
                      {req.stage}
                    </Badge>
                  </div>
                  {req.assigned?.full_name && (
                    <p className="text-xs text-muted-foreground mt-2">Assigned to: {req.assigned.full_name}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No preventive maintenance tasks scheduled for this date</p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
