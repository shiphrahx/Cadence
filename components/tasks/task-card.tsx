"use client"

import { Task } from "@/lib/types/task"
import { Circle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  isDragging?: boolean
}

export function TaskCard({ task, onEdit, isDragging = false }: TaskCardProps) {
  const getPriorityChipColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 border-red-200"
      case "Medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "Low":
        return "bg-green-50 text-green-700 border-green-200"
    }
  }

  const getStatusChipColor = (status: Task["status"]) => {
    switch (status) {
      case "Not started":
        return "bg-gray-50 text-gray-600 border-gray-200"
      case "In progress":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Blocked":
        return "bg-red-50 text-red-700 border-red-200"
      case "Done":
        return "bg-green-50 text-green-700 border-green-200"
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return null
    const d = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const taskDate = new Date(d)
    taskDate.setHours(0, 0, 0, 0)

    if (taskDate.getTime() === today.getTime()) {
      return "Today"
    } else if (taskDate.getTime() === today.getTime() + 86400000) {
      return "Tomorrow"
    } else {
      return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
    }
  }

  const isDone = task.status === "Done"

  return (
    <div
      className={cn(
        "group bg-white border border-gray-100 rounded-[10px] p-3 cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:border-gray-200",
        isDragging && "shadow-lg scale-[1.02] opacity-90 border-gray-300"
      )}
      onClick={() => onEdit(task)}
    >
      {/* Row 1: Status Icon + Title */}
      <div className="flex items-start gap-2 mb-2">
        {isDone ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
        ) : (
          <Circle className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />
        )}
        <h4 className="text-[15px] font-semibold text-gray-900 line-clamp-2 break-words overflow-hidden flex-1">
          {task.title}
        </h4>
      </div>

      {/* Row 2: Priority + Status Chips */}
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border h-[22px]",
            getPriorityChipColor(task.priority)
          )}
        >
          {task.priority}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border h-[22px]",
            getStatusChipColor(task.status)
          )}
        >
          {task.status}
        </span>
      </div>

      {/* Row 3: Meta (Due Date) */}
      {task.dueDate && (
        <div className="flex items-center">
          <p className="text-[12px] text-gray-500">{formatDate(task.dueDate)}</p>
        </div>
      )}
    </div>
  )
}
