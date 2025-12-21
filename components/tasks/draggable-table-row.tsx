"use client"

import { Task } from "@/lib/types/task"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ReactNode } from "react"

interface DraggableTableRowProps {
  task: Task
  children: ReactNode
}

export function DraggableTableRow({ task, children }: DraggableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 220ms cubic-bezier(0.2, 0, 0, 1)",
  }

  // Show minimal placeholder while dragging
  if (isDragging) {
    return (
      <tr ref={setNodeRef} style={style} {...attributes} {...listeners} className="border-b">
        <td colSpan={5} className="p-3">
          <div className="h-8 border-2 border-dashed border-gray-300 rounded bg-gray-50/50" />
        </td>
      </tr>
    )
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border-b hover:bg-gray-50 cursor-grab active:cursor-grabbing"
    >
      {children}
    </tr>
  )
}
