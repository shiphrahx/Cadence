"use client"

import { useState, useRef, useEffect } from "react"
import { Task, TaskStatus } from "@/lib/types/task"
import { Input } from "@/components/ui/input"

interface InlineTaskFormProps {
  status?: TaskStatus
  list: Task["list"]
  onSave: (title: string, status: TaskStatus) => void
  onCancel: () => void
}

export function InlineTaskForm({ status = "Not started", list, onSave, onCancel }: InlineTaskFormProps) {
  const [title, setTitle] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && title.trim()) {
      onSave(title.trim(), status)
      setTitle("")
    } else if (e.key === "Escape") {
      onCancel()
    }
  }

  const handleBlur = () => {
    if (title.trim()) {
      onSave(title.trim(), status)
    } else {
      onCancel()
    }
  }

  return (
    <div className="bg-white border border-primary-500 rounded-lg p-3 shadow-md">
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Task title... (Enter to save, Esc to cancel)"
        className="text-sm"
      />
    </div>
  )
}
