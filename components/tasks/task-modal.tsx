"use client"

import { useState, useEffect } from "react"
import { Task, TaskStatus, TaskCategory, TASK_STATUSES, TASK_PRIORITIES, TASK_CATEGORIES } from "@/lib/types/task"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TaskModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
  onDelete?: (taskId: string) => void
}

export function TaskModal({ task, isOpen, onClose, onSave, onDelete }: TaskModalProps) {
  const [formData, setFormData] = useState<Task>({
    id: "",
    title: "",
    description: "",
    dueDate: null,
    priority: "Medium",
    category: "Task",
    status: "Not started",
    list: "backlog",
  })

  useEffect(() => {
    if (task) {
      setFormData(task)
    } else {
      setFormData({
        id: "",
        title: "",
        description: "",
        dueDate: null,
        priority: "Medium",
        category: "Task",
        status: "Not started",
        list: "backlog",
      })
    }
  }, [task, isOpen])

  const handleSave = () => {
    if (!formData.title.trim()) return
    onSave(formData)
    onClose()
  }

  const handleDelete = () => {
    if (task && onDelete) {
      if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
        onDelete(task.id)
        onClose()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update task details below." : "Create a new task."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-5">
          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <div className="flex gap-1.5 h-10">
                {TASK_PRIORITIES.map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority })}
                    className={`flex-1 px-2 py-1.5 text-xs font-medium rounded border-2 transition-colors whitespace-nowrap ${
                      formData.priority === priority
                        ? priority === "Very High"
                          ? "text-white border-[rgb(139,30,30)]"
                          : priority === "High"
                          ? "bg-red-100 text-red-700 border-red-300"
                          : priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                          : "bg-green-100 text-green-700 border-green-300"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                    style={
                      formData.priority === priority && priority === "Very High"
                        ? { backgroundColor: "lab(34 43.72 6.02)" }
                        : undefined
                    }
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as TaskCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate || ""}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value || null })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Task description..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {task && onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </div>
          <div>
            <Button onClick={handleSave} disabled={!formData.title.trim()}>
              {task ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
