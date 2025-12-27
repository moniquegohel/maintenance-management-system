"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Users, Wrench, BarChart3, Calendar, Settings } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/equipment", label: "Equipment", icon: Package },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/requests", label: "Requests", icon: Wrench },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <aside className="hidden lg:flex glass glass-hover flex-col gap-4 p-6 w-64 h-screen sticky top-0">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive ? "bg-white/20 text-foreground" : "text-foreground/70 hover:text-foreground hover:bg-white/10"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
