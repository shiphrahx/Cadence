"use client"

import { Task } from "@/lib/types/task"
import { Circle, CheckCircle2, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete?: (taskId: string) => void
  isDragging?: boolean
}

export function TaskCard({ task, onEdit, onDelete, isDragging = false }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [menuOpen])

  const getPriorityChipColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "Very High":
        return "text-white"
      case "High":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      case "Medium":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
      case "Low":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    }
  }

  const getPriorityChipStyle = (priority: Task["priority"]) => {
    if (priority === "Very High") {
      return { backgroundColor: "lab(34 43.72 6.02)" }
    }
    return undefined
  }

  const getStatusChipColor = (status: Task["status"]) => {
    switch (status) {
      case "Not started":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
      case "In progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "Blocked":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      case "Done":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
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

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(!menuOpen)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    onEdit(task)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    if (onDelete) {
      onDelete(task.id)
    }
  }

  return (
    <div
      className={cn(
        "group relative bg-white dark:bg-[#292929] border border-gray-100 dark:border-[#383838] rounded-[10px] p-3 cursor-grab transition-all duration-200",
        "hover:shadow-md hover:border-gray-200 dark:hover:border-[#4a4a4a]",
        isDragging && "shadow-lg scale-[1.02] opacity-90 border-gray-300 dark:border-gray-600 cursor-grabbing"
      )}
    >
      {/* Kebab Menu - Top Right, visible on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20" ref={menuRef}>
        <button
          onClick={handleMenuClick}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="p-1 hover:bg-gray-100 dark:hover:bg-[#333333] rounded cursor-pointer"
          aria-label="Task actions"
        >
          <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#292929] border border-gray-200 dark:border-[#383838] rounded-lg shadow-lg z-50">
            <button
              onClick={handleEdit}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#333333] cursor-pointer rounded-t-lg dark:text-gray-200"
            >
              Edit
            </button>
            {onDelete && (
              <button
                onClick={handleDelete}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer rounded-b-lg"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Row 1: Status Icon + Title */}
      <div className="flex items-start gap-2 mb-2">
        {isDone ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        ) : (
          <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
        )}
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 break-words overflow-hidden flex-1 leading-tight">
          {task.title}
        </h4>
      </div>

      {/* Row 2: Priority + Status Chips - Asana pill style */}
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 mr-2 text-xs font-medium",
            getPriorityChipColor(task.priority)
          )}
          style={getPriorityChipStyle(task.priority)}
        >
          {task.priority}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            getStatusChipColor(task.status)
          )}
        >
          {task.status}
        </span>
      </div>

      {/* Row 3: Meta (Due Date) */}
      {task.dueDate && (
        <div className="flex items-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(task.dueDate)}</p>
        </div>
      )}
    </div>
  )
}
