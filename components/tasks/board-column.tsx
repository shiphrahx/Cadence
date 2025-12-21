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

  return (
    <div className="flex flex-col h-full">
      {/* Column Header - Asana style */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] font-semibold text-gray-700">{status}</span>
          <span className="text-[13px] text-gray-400">{tasks.length}</span>
        </div>
        <button
          onClick={() => onQuickAdd(status)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Column Drop Area - Full height droppable container */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col min-h-[400px] p-2 rounded-lg transition-all duration-200",
          isOver && "bg-gray-50/80 ring-1 ring-gray-200"
        )}
      >
        {/* Sortable card list */}
        <div className="flex-1 space-y-2 min-h-[100px]">
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <DraggableTaskCard key={task.id} task={task} onEdit={onEdit} />
            ))}
          </SortableContext>

          {/* Empty state placeholder when dragging */}
          {tasks.length === 0 && isOver && (
            <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg bg-white/50">
              <p className="text-sm text-gray-400">Drop here</p>
            </div>
          )}
        </div>

        {/* Add Task Button - Outside sortable context, at bottom */}
        <button
          onClick={() => onQuickAdd(status)}
          className="w-full text-left px-2 py-1.5 text-[13px] text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5 mt-2"
        >
          <Plus className="h-3.5 w-3.5" />
          Add task
        </button>
      </div>
    </div>
  )
}
