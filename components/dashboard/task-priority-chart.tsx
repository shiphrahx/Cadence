"use client"

import { BarChart2 } from "lucide-react"

export function TaskPriorityChart() {
  return (
    <div className="flex flex-col items-center justify-center h-[220px] gap-3">
      <div className="rounded-full bg-[#292929] p-4">
        <BarChart2 className="h-7 w-7 text-gray-500" />
      </div>
      <div className="text-center">
        <p className="text-gray-400 text-sm font-medium">Priority Breakdown</p>
        <p className="text-gray-600 text-xs mt-1">Coming soon — configurable view by day / week / month</p>
      </div>
    </div>
  )
}
