"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, LogOut, Plane } from "lucide-react"

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  current?: boolean
}

interface SidebarProps {
  title: string
  subtitle: string
  navigation: NavigationItem[]
  theme: "admin" | "agent"
  onLogout?: () => void
}

export function ReusableSidebar({ title, subtitle, navigation, theme, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const themeClasses = {
    admin: {
      bg: "bg-gray-900",
      text: "text-white",
      border: "border-gray-800",
      accent: "text-gray-400",
      hover: "hover:text-white hover:bg-gray-800",
      active: "bg-blue-600 text-white",
      inactive: "text-gray-300 hover:text-white hover:bg-gray-800",
      gradient: "from-blue-500 to-indigo-500",
      badgeBg: "bg-gray-700 text-gray-300",
    },
    agent: {
      bg: "bg-green-900",
      text: "text-white",
      border: "border-green-800",
      accent: "text-green-400",
      hover: "hover:text-white hover:bg-green-800",
      active: "bg-green-600 text-white",
      inactive: "text-green-300 hover:text-white hover:bg-green-800",
      gradient: "from-green-500 to-emerald-500",
      badgeBg: "bg-green-700 text-green-300",
    },
  }

  const currentTheme = themeClasses[theme]

  return (
    <div
      className={cn(
        currentTheme.bg,
        currentTheme.text,
        "transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className={cn("p-4 border-b", currentTheme.border)}>
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-3">
              <div className={cn("bg-gradient-to-r p-2 rounded-lg", currentTheme.gradient)}>
                <Plane className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">{title}</div>
                <div className={cn("text-xs", currentTheme.accent)}>{subtitle}</div>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(currentTheme.accent, currentTheme.hover)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? currentTheme.active : currentTheme.inactive,
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className={cn(currentTheme.badgeBg, "text-xs")}>
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={cn("p-4 border-t", currentTheme.border)}>
        <Button variant="ghost" className={cn("w-full justify-start", currentTheme.inactive)} onClick={onLogout}>
          <LogOut className="h-5 w-5 mr-3" />
          {!collapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  )
}
