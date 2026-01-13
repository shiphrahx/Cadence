"use client"

import { useState, useMemo } from "react"
import { Task, TaskStatus, TaskPriority, TaskCategory, TASK_STATUSES, TASK_PRIORITIES, TASK_CATEGORIES } from "@/lib/types/task"
import { BadgeSelect } from "@/components/ui/badge-select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, ArrowUpDown, Filter, GripVertical, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { DraggableTableRow } from "./draggable-table-row"

interface BacklogTableProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onQuickAdd: () => void
  onEdit: (task: Task) => void
  onDelete?: (taskId: string) => void
}

type SortField = "title" | "dueDate" | "priority" | "status" | "category"
type SortDirection = "asc" | "desc"

export function BacklogTable({ tasks, onUpdateTask, onQuickAdd, onEdit, onDelete }: BacklogTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | "all">("all")
  const [sortField, setSortField] = useState<SortField>("dueDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [showFilters, setShowFilters] = useState(false)

  const { setNodeRef, isOver } = useDroppable({
    id: "backlog-table",
    data: {
      type: "backlog",
    },
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || task.status === statusFilter
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
      const matchesCategory = categoryFilter === "all" || task.category === categoryFilter
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory
    })

    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "dueDate":
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
          comparison = dateA - dateB
          break
        case "priority": {
          const priorityOrder: Record<TaskPriority, number> = { "Very High": 4, High: 3, Medium: 2, Low: 1 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        }
        case "status": {
          const statusOrder = { "Not started": 1, "In progress": 2, "Blocked": 3, "Done": 4 }
          comparison = statusOrder[a.status] - statusOrder[b.status]
          break
        }
        case "category":
          comparison = a.category.localeCompare(b.category)
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    return filtered
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, sortField, sortDirection])

  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case "Very High":
        return "text-white"
      case "High":
        return "bg-red-100 text-red-700"
      case "Medium":
        return "bg-yellow-100 text-yellow-700"
      case "Low":
        return "bg-green-100 text-green-700"
    }
  }

  const getPriorityBadgeStyle = (priority: TaskPriority) => {
    if (priority === "Very High") {
      return { backgroundColor: "lab(34 43.72 6.02)" }
    }
    return undefined
  }

  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case "Not started":
        return "bg-gray-100 text-gray-700"
      case "In progress":
        return "bg-blue-100 text-blue-700"
      case "Blocked":
        return "bg-red-100 text-red-700"
      case "Done":
        return "bg-green-100 text-green-700"
    }
  }

  const getCategoryBadgeClass = (category: TaskCategory) => {
    return "bg-gray-100 text-gray-700";
    // switch (category) {
    //   case "Task":
    //     return "bg-orange-100 text-orange-700"
    //   case "Meeting":
    //     return "bg-blue-100 text-blue-700"
    //   case "Career Growth":
    //     return "bg-purple-100 text-purple-700"
    //   case "People":
    //     return "bg-pink-100 text-pink-700"
    //   case "Delivery":
    //     return "bg-cyan-100 text-cyan-700"
    //   case "Admin":
    //     return "bg-gray-100 text-gray-700"
    //   case "Management":
    //     return "bg-indigo-100 text-indigo-700"
    // }
  }

  const formatDate = (date: string | null) => {
    if (!date) return ""
    return new Date(date).toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute -translate-y-1/2 left-3 top-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
        <Button onClick={onQuickAdd}>
          <Plus className="h-4 w-4 mr-2" />
          New task
        </Button>
      </div>

      {showFilters && (
        <div className="flex border items-center gap-4 p-4 bg-[#262626] rounded-lg border-[#383838]">
          <div className="flex items-center gap-2">
            <label className="text-gray-100 font-medium">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
              className="border text-sm border-gray-300 rounded-md px-2 py-1"
            >
              <option value="all">All</option>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-100 font-medium">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "all")}
              className="border text-sm border-gray-300 rounded-md px-2 py-1"
            >
              <option value="all">All</option>
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-100 font-medium">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as TaskCategory | "all")}
              className="border text-sm border-gray-300 rounded-md px-2 py-1"
            >
              <option value="all">All</option>
              {TASK_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div
        ref={setNodeRef}
        className={cn(
          "border border-[#383838] rounded-lg bg-white bg-[#262626] transition-colors max-md:overflow-x-auto",
          isOver && "ring-2 ring-primary-500 ring-primary-dark-500 bg-primary-50 bg-primary-dark-900/30 bg-primary-dark-900/30"
        )}
      >
        <table className="w-full border-collapse">
          <colgroup>
            <col className="w-12 max-md:w-10" />
            <col className="w-auto max-md:min-w-[280px]" />
            <col className="w-32 max-md:min-w-[120px]" />
            <col className="w-32 max-md:min-w-[120px]" />
            <col className="w-32 max-md:min-w-[120px]" />
            <col className="w-32 max-md:min-w-[120px]" />
            <col className="w-12 max-md:w-10" />
          </colgroup>
          <thead>
            <tr className="border-[#383838]">
              <th className="p-3 bg-[#262626]"></th>
              <th className="text-gray-100 p-3 bg-[#262626] font-semibold">
                <button
                  onClick={() => handleSort("title")}
                  className="flex hover:text-primary-600 hover:text-primary-dark-400 hover:text-primary-400 items-center gap-1 text-primary-dark-400"
                >
                  Name
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="text-gray-100 p-3 bg-[#262626] font-semibold">
                <button
                  onClick={() => handleSort("status")}
                  className="flex hover:text-primary-600 hover:text-primary-dark-400 hover:text-primary-400 items-center gap-1 text-primary-dark-400"
                >
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="text-gray-100 p-3 bg-[#262626] font-semibold">
                <button
                  onClick={() => handleSort("dueDate")}
                  className="flex hover:text-primary-600 hover:text-primary-dark-400 hover:text-primary-400 items-center gap-1 text-primary-dark-400"
                >
                  Due Date
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="text-gray-100 p-3 bg-[#262626] font-semibold">
                <button
                  onClick={() => handleSort("priority")}
                  className="flex hover:text-primary-600 hover:text-primary-dark-400 hover:text-primary-400 items-center gap-1 text-primary-dark-400"
                >
                  Priority
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="text-gray-100 p-3 bg-[#262626] font-semibold">
                <button
                  onClick={() => handleSort("category")}
                  className="flex hover:text-primary-600 hover:text-primary-dark-400 hover:text-primary-400 items-center gap-1 text-primary-dark-400"
                >
                  Category
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="p-3 bg-[#262626]"></th>
            </tr>
          </thead>
          <tbody>
            <SortableContext items={filteredAndSortedTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {filteredAndSortedTasks.map((task) => (
                <DraggableTableRow
                  key={task.id}
                  task={task}
                  onDoubleClick={() => onEdit(task)}
                >
                  <td
                    className="p-3 text-center"
                    onDoubleClick={(e) => e.stopPropagation()}
                  >
                    <div className="active:cursor-grabbing drag-handle cursor-grab inline-flex">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </div>
                  </td>
                  <td
                    className="p-3 font-medium text-gray-100 overflow-hidden"
                    title={task.title}
                  >
                    <div className="line-clamp-2 break-all max-md:break-words">{task.title}</div>
                  </td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <BadgeSelect
                      value={task.status}
                      onValueChange={(value) => onUpdateTask(task.id, { status: value as TaskStatus })}
                      options={TASK_STATUSES.map((status) => ({
                        value: status,
                        label: status,
                        className: getStatusBadgeClass(status),
                      }))}
                    />
                  </td>
                  <td className="p-3 text-gray-300">{formatDate(task.dueDate)}</td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <BadgeSelect
                      value={task.priority}
                      onValueChange={(value) => onUpdateTask(task.id, { priority: value as TaskPriority })}
                      options={TASK_PRIORITIES.map((priority) => ({
                        value: priority,
                        label: priority,
                        className: getPriorityBadgeClass(priority),
                        style: getPriorityBadgeStyle(priority),
                      }))}
                    />
                  </td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <BadgeSelect
                      value={task.category}
                      onValueChange={(value) => onUpdateTask(task.id, { category: value as TaskCategory })}
                      options={TASK_CATEGORIES.map((category) => ({
                        value: category,
                        label: category,
                        className: getCategoryBadgeClass(category),
                      }))}
                    />
                  </td>
                  <td
                    className="p-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onDelete) onDelete(task.id)
                      }}
                      className="hover:text-red-600 text-gray-400 cursor-pointer transition-colors"
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-4 w-4 inline-block" />
                    </button>
                  </td>
                </DraggableTableRow>
              ))}
            </SortableContext>
            <tr>
              <td colSpan={7} className="p-0">
                <button
                  onClick={onQuickAdd}
                  className="hover:text-gray-700 hover:text-gray-200 hover:bg-gray-50 hover:bg-[#292929] flex w-full text-gray-400 px-3 py-3 transition-colors items-center gap-2 border-[#383838]"
                >
                  <Plus className="h-4 w-4" />
                  New task
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
