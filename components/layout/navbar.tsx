"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Menu, LogOut } from "lucide-react"

export function Navbar() {
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <nav className="glass glass-hover sticky top-0 z-50 backdrop-blur-xl border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">GG</span>
          </div>
          <span className="text-xl font-bold text-foreground">GearGuard</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <a href="/dashboard" className="text-foreground/80 hover:text-foreground transition-colors">
            Dashboard
          </a>
          <a href="/equipment" className="text-foreground/80 hover:text-foreground transition-colors">
            Equipment
          </a>
          <a href="/requests" className="text-foreground/80 hover:text-foreground transition-colors">
            Requests
          </a>
          <a href="/teams" className="text-foreground/80 hover:text-foreground transition-colors">
            Teams
          </a>
          <a href="/calendar" className="text-foreground/80 hover:text-foreground transition-colors">
            Calendar
          </a>
          <a href="/reports" className="text-foreground/80 hover:text-foreground transition-colors">
            Reports
          </a>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-foreground/80 hover:text-foreground">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <button className="md:hidden" onClick={() => setShowMenu(!showMenu)}>
          <Menu className="w-6 h-6 text-foreground" />
        </button>
      </div>

      {showMenu && (
        <div className="md:hidden glass glass-hover border-t border-white/20 p-4 space-y-2">
          <a href="/dashboard" className="block text-foreground/80 hover:text-foreground p-2">
            Dashboard
          </a>
          <a href="/equipment" className="block text-foreground/80 hover:text-foreground p-2">
            Equipment
          </a>
          <a href="/requests" className="block text-foreground/80 hover:text-foreground p-2">
            Requests
          </a>
          <a href="/teams" className="block text-foreground/80 hover:text-foreground p-2">
            Teams
          </a>
          <a href="/calendar" className="block text-foreground/80 hover:text-foreground p-2">
            Calendar
          </a>
          <a href="/reports" className="block text-foreground/80 hover:text-foreground p-2">
            Reports
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-foreground/80 hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      )}
    </nav>
  )
}
