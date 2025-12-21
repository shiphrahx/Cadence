"use client"

import { useState, useEffect } from "react"
import { Task, TaskStatus, TASK_STATUSES } from "@/lib/types/task"
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { BoardColumn } from "@/components/tasks/board-column"
import { BacklogTable } from "@/components/tasks/backlog-table"
import { TaskModal } from "@/components/tasks/task-modal"
import { TaskCard } from "@/components/tasks/task-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

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
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalDefaults, setModalDefaults] = useState<Partial<Task>>({})
  const [isMounted, setIsMounted] = useState(false)

  // Only enable DnD on client to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    // Handle dropping over a column
    if (over.data.current?.type === "column") {
      const newStatus = over.data.current.status as TaskStatus
      if (activeTask.status !== newStatus || activeTask.list !== "week") {
        setTasks((tasks) =>
          tasks.map((t) =>
            t.id === activeTask.id
              ? { ...t, status: newStatus, list: "week" }
              : t
          )
        )
      }
    }

    // Handle dropping over backlog
    if (over.data.current?.type === "backlog") {
      if (activeTask.list !== "backlog") {
        setTasks((tasks) =>
          tasks.map((t) =>
            t.id === activeTask.id ? { ...t, list: "backlog" } : t
          )
        )
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
  }

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((tasks) =>
      tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    )
  }

  const handleSaveTask = (task: Task) => {
    if (task.id) {
      // Update existing task
      handleUpdateTask(task.id, task)
    } else {
      // Create new task
      const newTask = {
        ...task,
        id: Math.random().toString(36).substr(2, 9),
      }
      setTasks((tasks) => [...tasks, newTask])
    }
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks((tasks) => tasks.filter((t) => t.id !== taskId))
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
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">Manage your tasks and priorities</p>
          </div>
        </div>
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">Manage your tasks and priorities</p>
          </div>
        </div>

        {/* This Week Board */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">This week</h2>
            <Button size="sm" onClick={handleNewTaskHeader}>
              <Plus className="h-4 w-4 mr-2" />
              New task
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {TASK_STATUSES.map((status) => (
              <BoardColumn
                key={status}
                status={status}
                tasks={weekTasks.filter((t) => t.status === status)}
                onEdit={handleEditTask}
                onQuickAdd={handleQuickAddBoard}
              />
            ))}
          </div>
        </div>

        {/* Backlog */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Backlog</h2>
          <BacklogTable
            tasks={backlogTasks}
            onUpdateTask={handleUpdateTask}
            onQuickAdd={handleQuickAddBacklog}
            onEdit={handleEditTask}
          />
        </div>

        {/* Task Modal */}
        <TaskModal
          task={taskToDisplay}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
          onDelete={selectedTask ? handleDeleteTask : undefined}
        />

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} onEdit={() => {}} isDragging />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}
