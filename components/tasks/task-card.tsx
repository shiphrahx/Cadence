"use client"

import { Task } from "@/lib/types/task"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  isDragging?: boolean
}

export function TaskCard({ task, onEdit, isDragging = false }: TaskCardProps) {
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-300"
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "Low":
        return "bg-green-100 text-green-700 border-green-300"
    }
  }

  const getPriorityBackground = (priority: Task["priority"]) => {
    return "bg-white"
    // switch (priority) {
    //   case "High":
    //     return "bg-red-100 hover:bg-red-100 border-red-200"
    //   case "Medium":
    //     return "bg-yellow-100 hover:bg-yellow-100 border-yellow-200"
    //   case "Low":
    //     return "bg-green-100 hover:bg-green-100 border-green-200"
    // }
  }

  const getCategoryColor = (category: Task["category"]) => {
    return "bg-gray-100 text-gray-700 border-gray-300";
    // switch (category) {
    //   case "Task":
    //     return "bg-orange-100 text-orange-700 border-orange-300"
    //   case "Meeting":
    //     return "bg-blue-100 text-blue-700 border-blue-300"
    //   case "Career Growth":
    //     return "bg-purple-100 text-purple-700 border-purple-300"
    //   case "People":
    //     return "bg-pink-100 text-pink-700 border-pink-300"
    //   case "Delivery":
    //     return "bg-cyan-100 text-cyan-700 border-cyan-300"
    //   case "Admin":
    //     return "bg-gray-100 text-gray-700 border-gray-300"
    //   case "Management":
    //     return "bg-indigo-100 text-indigo-700 border-indigo-300"
    // }
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
      return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }

  return (
    <div
      className={cn(
        "group border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all",
        getPriorityBackground(task.priority),
        isDragging && "opacity-50"
      )}
      title={task.title}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 break-words overflow-hidden">{task.title}</h4>
          {task.dueDate && (
            <p className="text-xs text-gray-500 mt-1">{formatDate(task.dueDate)}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(task)
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border",
            getPriorityColor(task.priority)
          )}
        >
          {task.priority}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border",
            getCategoryColor(task.category)
          )}
        >
          {task.category}
        </span>
      </div>
    </div>
  )
}
