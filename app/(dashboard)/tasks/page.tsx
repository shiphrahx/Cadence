"use client"

import { useState, useEffect } from "react"
import { Task, TaskStatus, TASK_STATUSES } from "@/lib/types/task"
import { getTasks, createTask, updateTask, deleteTask as deleteTaskService } from "@/lib/services/tasks"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  CollisionDetection
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { BoardColumn } from "@/components/tasks/board-column"
import { BacklogTable } from "@/components/tasks/backlog-table"
import { TaskModal } from "@/components/tasks/task-modal"
import { TaskCard } from "@/components/tasks/task-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Mock data
const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Team meeting sync up",
    dueDate: "2025-12-23",
    priority: "High",
    category: "Meeting",
    status: "Not started",
    list: "week",
  },
  {
    id: "2",
    title: "Performance reviews",
    dueDate: "2025-12-24",
    priority: "Low",
    category: "Task",
    status: "In progress",
    list: "week",
  },
  {
    id: "3",
    title: "AWS Access",
    dueDate: "2025-12-26",
    priority: "Low",
    category: "Task",
    status: "Blocked",
    list: "week",
  },
  {
    id: "4",
    title: "Book 1:1 with Tommy",
    dueDate: "2025-12-23",
    priority: "High",
    category: "Meeting",
    status: "Done",
    list: "week",
  },
  {
    id: "5",
    title: "Prepare presentation",
    dueDate: "2025-12-22",
    priority: "High",
    category: "Task",
    status: "Not started",
    list: "week",
  },
  {
    id: "6",
    title: "Prepare Sprint 1",
    dueDate: "2025-12-25",
    priority: "Medium",
    category: "Task",
    status: "Not started",
    list: "week",
  },
  {
    id: "7",
    title: "Review DevOps backlog",
    dueDate: "2026-01-06",
    priority: "High",
    category: "Task",
    status: "Not started",
    list: "backlog",
  },
  {
    id: "8",
    title: "Schedule 1:1 with product",
    dueDate: "2025-12-31",
    priority: "Low",
    category: "Meeting",
    status: "Not started",
    list: "backlog",
  },
  {
    id: "9",
    title: "Lorem ipsum",
    dueDate: "2026-01-01",
    priority: "Medium",
    category: "Task",
    status: "Not started",
    list: "backlog",
  },
  {
    id: "10",
    title: "ImplementtheauthenticationflowwithGoogleOAuthintegrationandsupabasebackendwithoutanyspacesinthetext",
    dueDate: "2026-01-15",
    priority: "High",
    category: "Task",
    status: "Not started",
    list: "backlog",
  },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalDefaults, setModalDefaults] = useState<Partial<Task>>({})
  const [isMounted, setIsMounted] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load tasks from Supabase on mount
  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      const data = await getTasks()
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Only enable DnD on client to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Small threshold to prevent accidental drags
        delay: 0,
        tolerance: 5,
      },
    })
  )

  // Custom collision detection strategy - combines pointer and rect intersection
  const collisionDetectionStrategy: CollisionDetection = (args) => {
    // First, use pointer-based detection for precise insertion
    const pointerCollisions = pointerWithin(args)

    if (pointerCollisions.length > 0) {
      return pointerCollisions
    }

    // Fallback to rectangle intersection
    const rectCollisions = rectIntersection(args)

    if (rectCollisions.length > 0) {
      return rectCollisions
    }

    // Final fallback to closest center
    return closestCenter(args)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    setTasks((currentTasks) => {
      const activeTask = currentTasks.find((t) => t.id === activeId)
      if (!activeTask) return currentTasks

      // Determine if we're over a task or a column
      const overTask = currentTasks.find((t) => t.id === overId)
      const overColumn = over.data.current?.type === "column" ? over.data.current.status : null
      const overBacklog = over.data.current?.type === "backlog"

      // Case 1: Dragging over another task (insert before/after)
      if (overTask) {
        // Check if already in the correct position to prevent unnecessary updates
        const activeIndex = currentTasks.findIndex((t) => t.id === activeId)
        const overIndex = currentTasks.findIndex((t) => t.id === overId)

        if (activeIndex === overIndex) return currentTasks
        if (activeTask.status === overTask.status && activeTask.list === overTask.list && Math.abs(activeIndex - overIndex) === 1) {
          return currentTasks
        }

        // Determine target status and list
        const targetStatus = overTask.status
        const targetList = overTask.list

        // Remove active task from array
        const newTasks = currentTasks.filter((t) => t.id !== activeId)

        // Update active task's status and list
        const updatedActiveTask = {
          ...activeTask,
          status: targetStatus,
          list: targetList
        }

        // Find new insertion index (accounting for removed item)
        let insertIndex = newTasks.findIndex((t) => t.id === overId)

        // Insert at the correct position
        newTasks.splice(insertIndex, 0, updatedActiveTask)

        return newTasks
      }

      // Case 2: Dragging over a column (append to end)
      if (overColumn) {
        // Prevent update if already in correct state
        if (activeTask.status === overColumn && activeTask.list === "week") {
          return currentTasks
        }

        return currentTasks.map((t) =>
          t.id === activeId
            ? { ...t, status: overColumn as TaskStatus, list: "week" }
            : t
        )
      }

      // Case 3: Dragging over backlog
      if (overBacklog) {
        // Prevent update if already in backlog
        if (activeTask.list === "backlog") {
          return currentTasks
        }

        return currentTasks.map((t) =>
          t.id === activeId
            ? { ...t, list: "backlog" }
            : t
        )
      }

      return currentTasks
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)

    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    // Final position adjustment on drop
    const overTask = tasks.find((t) => t.id === overId)

    if (overTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId)
        const overIndex = tasks.findIndex((t) => t.id === overId)

        // Use arrayMove for smooth reordering within same list
        if (activeIndex !== overIndex) {
          return arrayMove(tasks, activeIndex, overIndex)
        }

        return tasks
      })
    }
  }

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await updateTask(taskId, updates)
      setTasks((tasks) =>
        tasks.map((t) => (t.id === taskId ? updatedTask : t))
      )
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleSaveTask = async (task: Task) => {
    try {
      if (task.id) {
        // Update existing task
        await handleUpdateTask(task.id, task)
      } else {
        // Create new task
        const newTask = await createTask(task)
        setTasks((tasks) => [...tasks, newTask])
      }
    } catch (error) {
      console.error('Failed to save task:', error)
    }
  }

  const handleDeleteRequest = (taskId: string) => {
    setDeleteConfirmId(taskId)
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      try {
        await deleteTaskService(deleteConfirmId)
        setTasks((tasks) => tasks.filter((t) => t.id !== deleteConfirmId))
        setDeleteConfirmId(null)
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirmId(null)
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setModalDefaults({})
    setIsModalOpen(true)
  }

  const handleQuickAddBoard = (status: TaskStatus) => {
    setSelectedTask(null)
    setModalDefaults({ list: "week", status })
    setIsModalOpen(true)
  }

  const handleQuickAddBacklog = () => {
    setSelectedTask(null)
    setModalDefaults({ list: "backlog", status: "Not started" })
    setIsModalOpen(true)
  }

  const handleNewTaskHeader = () => {
    setSelectedTask(null)
    setModalDefaults({ list: "week", status: "Not started" })
    setIsModalOpen(true)
  }

  const weekTasks = tasks.filter((t) => t.list === "week")
  const backlogTasks = tasks.filter((t) => t.list === "backlog")

  const taskToDisplay = selectedTask || {
    id: "",
    title: "",
    description: "",
    dueDate: null,
    priority: "Medium" as const,
    category: "Task" as const,
    status: "Not started" as const,
    list: "backlog" as const,
    ...modalDefaults,
  }

  // Show a loading state until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="flex flex-col gap-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-100 font-bold">Tasks</h1>
            <p className="text-gray-400 mt-1">Manage your tasks and priorities</p>
          </div>
        </div>
        <div className="text-gray-400 py-12">Loading...</div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-100 font-bold">Tasks</h1>
            <p className="text-gray-400 mt-1">Manage your tasks and priorities</p>
          </div>
        </div>

        {/* This Week Board */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-100 font-semibold">This week</h2>
            <Button onClick={handleNewTaskHeader}>
              <Plus className="h-4 w-4 mr-2" />
              New task
            </Button>
          </div>
          <div className="rounded-lg p-4 max-md:p-2">
            {/* Desktop: grid layout unchanged, Mobile: horizontal scroll */}
            <div className="grid grid-cols-4 gap-6 max-md:px-2">
              {TASK_STATUSES.map((status) => (
                <BoardColumn
                  key={status}
                  status={status}
                  tasks={weekTasks.filter((t) => t.status === status)}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteRequest}
                  onQuickAdd={handleQuickAddBoard}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Backlog */}
        <div>
          <h2 className="text-gray-100 font-semibold mb-4">Backlog</h2>
          <BacklogTable
            tasks={backlogTasks}
            onUpdateTask={handleUpdateTask}
            onQuickAdd={handleQuickAddBacklog}
            onEdit={handleEditTask}
            onDelete={handleDeleteRequest}
          />
        </div>

        {/* Task Modal */}
        <TaskModal
          task={taskToDisplay}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
          onDelete={selectedTask ? handleDeleteRequest : undefined}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && handleCancelDelete()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Drag Overlay - Floating card preview */}
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="rotate-3 cursor-grabbing">
              <TaskCard task={activeTask} onEdit={() => {}} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}
