"use client"

import { DataTable, ColumnDef, FilterDef } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, UserX, UserCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { type Person } from "@/lib/mock-data"

export type { Person }

interface PeopleTableProps {
  people: Person[]
  onRowClick?: (person: Person) => void
  onEdit: (person: Person) => void
  onDelete: (person: Person) => void
  onToggleStatus: (person: Person) => void
  onQuickAdd: () => void
}

export function PeopleTable({
  people,
  onRowClick,
  onEdit,
  onDelete,
  onToggleStatus,
  onQuickAdd,
}: PeopleTableProps) {
  const [selectedPersonMenu, setSelectedPersonMenu] = useState<number | null>(null)

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (selectedPersonMenu !== null) {
        setSelectedPersonMenu(null)
      }
    }

    if (selectedPersonMenu !== null) {
      document.addEventListener("click", handleClickOutside)
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [selectedPersonMenu])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case "Junior":
        return "!bg-green-100 !text-green-700 !border-green-300"
      case "Mid":
        return "!bg-yellow-100 !text-yellow-700 !border-yellow-300"
      case "Senior":
        return "!bg-pink-100 !text-pink-700 !border-pink-300"
      default:
        return "!bg-blue-100 !text-blue-700 !border-blue-300"
    }
  }

  const columns: ColumnDef<Person>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: (person) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
            <span className="text-sm font-semibold">{getInitials(person.name)}</span>
          </div>
          <span className="font-medium dark:text-gray-100">{person.name}</span>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      accessorKey: "role",
      cell: (person) => (
        <span className="text-gray-700 dark:text-gray-300">{person.role}</span>
      ),
    },
    {
      id: "level",
      header: "Level",
      accessorKey: "level",
      cell: (person) => (
        <Badge variant="outline" className={getLevelBadgeClass(person.level)}>
          {person.level}
        </Badge>
      ),
    },
    {
      id: "teams",
      header: "Teams",
      sortable: false,
      cell: (person) => (
        <div className="flex flex-wrap gap-1">
          {person.teams.map((team, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {team}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: "startDate",
      header: "Start Date",
      accessorKey: "startDate",
      cell: (person) => (
        <span className="text-gray-700 dark:text-gray-300">
          {new Date(person.startDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: (person) => (
        <Badge
          variant={person.status === "active" ? "success" : "secondary"}
          className={
            person.status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          }
        >
          {person.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      sortable: false,
      className: "text-right",
      cell: (person) => (
        <div className="relative inline-block">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              if (person.id !== undefined) {
                setSelectedPersonMenu(
                  selectedPersonMenu === person.id ? null : person.id
                )
              }
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {person.id !== undefined && selectedPersonMenu === person.id && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-[#262626] ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50">
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(person)
                    setSelectedPersonMenu(null)
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#292929] cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleStatus(person)
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#292929] cursor-pointer"
                >
                  {person.status === "active" ? (
                    <>
                      <UserX className="h-4 w-4" />
                      Set Inactive
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Set Active
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(person)
                    setSelectedPersonMenu(null)
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ]

  const filters: FilterDef<Person>[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      filterFn: (person, value) => person.status === value,
    },
    {
      id: "level",
      label: "Level",
      options: [
        { value: "Junior", label: "Junior" },
        { value: "Mid", label: "Mid" },
        { value: "Senior", label: "Senior" },
        { value: "Staff", label: "Staff" },
        { value: "Principal", label: "Principal" },
      ],
      filterFn: (person, value) => person.level === value,
    },
  ]

  return (
    <DataTable
      data={people}
      columns={columns}
      filters={filters}
      searchKeys={["name", "role"]}
      searchPlaceholder="Search people..."
      onRowClick={onRowClick}
      onQuickAdd={onQuickAdd}
      quickAddLabel="Add person"
    />
  )
}
