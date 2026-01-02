"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { ThemeToggle } from "./theme-toggle"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#171717]">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        {children}
      </main>
    </div>
  )
}
