"use client"

import { DataTable, ColumnDef, FilterDef } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, UserX, UserCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { type Team } from "@/lib/mock-data"

export type { Team }

interface TeamsTableProps {
  teams: Team[]
  onEdit: (team: Team) => void
  onDelete: (team: Team) => void
  onToggleStatus: (team: Team) => void
  onQuickAdd: () => void
}

export function TeamsTable({
  teams,
  onEdit,
  onDelete,
  onToggleStatus,
  onQuickAdd,
}: TeamsTableProps) {
  const [selectedTeamMenu, setSelectedTeamMenu] = useState<number | null>(null)

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (selectedTeamMenu !== null) {
        setSelectedTeamMenu(null)
      }
    }

    if (selectedTeamMenu !== null) {
      document.addEventListener("click", handleClickOutside)
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [selectedTeamMenu])

  const columns: ColumnDef<Team>[] = [
    {
      id: "name",
      header: "Team Name",
      accessorKey: "name",
      cell: (team) => <span className="font-medium dark:text-gray-100">{team.name}</span>,
    },
    {
      id: "description",
      header: "Description",
      accessorKey: "description",
      cell: (team) => (
        <span className="text-gray-700 dark:text-gray-300">{team.description}</span>
      ),
    },
    {
      id: "memberCount",
      header: "Members",
      accessorKey: "memberCount",
      cell: (team) => (
        <span className="text-gray-700 dark:text-gray-300">{team.memberCount}</span>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
      cell: (team) => (
        <span className="text-gray-700 dark:text-gray-300">
          {new Date(team.createdAt).toLocaleDateString("en-GB", {
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
      cell: (team) => (
        <Badge
          variant={team.status === "active" ? "success" : "secondary"}
          className={
            team.status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          }
        >
          {team.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      sortable: false,
      className: "text-right",
      cell: (team) => (
        <div className="relative inline-block">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              if (team.id !== undefined) {
                setSelectedTeamMenu(
                  selectedTeamMenu === team.id ? null : team.id
                )
              }
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {team.id !== undefined && selectedTeamMenu === team.id && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-[#262626] ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50">
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(team)
                    setSelectedTeamMenu(null)
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#292929] cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleStatus(team)
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#292929] cursor-pointer"
                >
                  {team.status === "active" ? (
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
                    onDelete(team)
                    setSelectedTeamMenu(null)
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

  const filters: FilterDef<Team>[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      filterFn: (team, value) => team.status === value,
    },
  ]

  return (
    <DataTable
      data={teams}
      columns={columns}
      filters={filters}
      searchKeys={["name", "description"]}
      searchPlaceholder="Search teams..."
      onQuickAdd={onQuickAdd}
      quickAddLabel="Create team"
    />
  )
}
