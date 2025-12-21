"use client"

import { Task, TaskStatus } from "@/lib/types/task"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { DraggableTaskCard } from "./draggable-task-card"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface BoardColumnProps {
  status: TaskStatus
  tasks: Task[]
  onEdit: (task: Task) => void
  onQuickAdd: (status: TaskStatus) => void
}

export function BoardColumn({ status, tasks, onEdit, onQuickAdd }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: {
      type: "column",
      status,
    },
  })

  const getStatusIndicatorColor = (status: TaskStatus) => {
    switch (status) {
      case "Not started":
        return "bg-gray-400"
      case "In progress":
        return "bg-blue-500"
      case "Blocked":
        return "bg-red-500"
      case "Done":
        return "bg-green-500"
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-50 border-b px-3 py-2 mb-3 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", getStatusIndicatorColor(status))} />
          <span className="text-sm font-semibold text-gray-900">{status}</span>
          <span className="text-sm text-gray-500">({tasks.length})</span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 p-2 rounded-lg  min-h-[200px] transition-colors",
          isOver ? "border-primary-500 bg-primary-50" : "border-transparent bg-gray-50x"
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <DraggableTaskCard key={task.id} task={task} onEdit={onEdit} />
          ))}
        </SortableContext>

        <button
          onClick={() => onQuickAdd(status)}
          className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-dashed border-gray-300 hover:border-gray-400 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New task
        </button>
      </div>
    </div>
  )
}
