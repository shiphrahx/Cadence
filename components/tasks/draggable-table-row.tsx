"use client"

import { Task } from "@/lib/types/task"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ReactNode, cloneElement, Children, isValidElement } from "react"

interface DraggableTableRowProps {
  task: Task
  children: ReactNode
  onDoubleClick?: () => void
}

export function DraggableTableRow({ task, children, onDoubleClick }: DraggableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
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
      <tr ref={setNodeRef} style={style} {...attributes} className="border-b">
        <td colSpan={7} className="p-3">
          <div className="h-8 border-2 border-dashed border-gray-300 rounded bg-gray-50/50" />
        </td>
      </tr>
    )
  }

  // Clone children and attach drag handle ref to the first td (which contains the drag handle)
  const childrenArray = Children.toArray(children)
  const modifiedChildren = childrenArray.map((child, index) => {
    if (index === 0 && isValidElement(child)) {
      // First cell - attach drag listeners to it
      return cloneElement(child as React.ReactElement<any>, {
        ref: setActivatorNodeRef,
        ...listeners,
      })
    }
    return child
  })

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      onDoubleClick={onDoubleClick}
      className="border-b hover:bg-gray-50 transition-colors"
    >
      {modifiedChildren}
    </tr>
  )
}
