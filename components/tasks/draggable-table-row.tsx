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
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border-b hover:bg-gray-50 cursor-pointer"
    >
      {children}
    </tr>
  )
}
