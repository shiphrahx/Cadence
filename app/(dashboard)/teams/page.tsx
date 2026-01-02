"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Users as UsersIcon, MoreHorizontal, Pencil, Trash2, UserX, UserCheck } from "lucide-react"
import { TeamFormDialog } from "@/components/team-form-dialog"

interface Team {
  id?: number
  name: string
  description: string
  status: "active" | "inactive"
  memberCount: number
  createdAt: string
  memberIds?: number[]
  notes?: string
  documentationUrl?: string
}

interface Person {
  id: number
  name: string
}

// Mock data - simplified person list for team assignment
const mockPeople: Person[] = [
  { id: 1, name: "Sarah Miller" },
  { id: 2, name: "John Doe" },
  { id: 3, name: "Emily Wong" },
  { id: 4, name: "Mike Chen" },
  { id: 5, name: "Alex Johnson" },
]

// Mock data
const initialTeams: Team[] = [
  {
    id: 1,
    name: "Platform Engineering",
    description: "Core platform and infrastructure team",
    status: "active",
    memberCount: 2,
    createdAt: "2024-01-15",
    memberIds: [1, 2],
  },
  {
    id: 2,
    name: "Product Development",
    description: "Customer-facing product features",
    status: "active",
    memberCount: 2,
    createdAt: "2024-02-01",
    memberIds: [2, 3],
  },
  {
    id: 3,
    name: "Mobile Team",
    description: "iOS and Android applications",
    status: "inactive",
    memberCount: 1,
    createdAt: "2023-11-10",
    memberIds: [5],
  },
]

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [showInactive, setShowInactive] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [selectedTeamMenu, setSelectedTeamMenu] = useState<number | null>(null)

  const filteredTeams = showInactive
    ? teams
    : teams.filter(team => team.status === "active")

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedTeamMenu !== null) {
        setSelectedTeamMenu(null)
      }
    }

    if (selectedTeamMenu !== null) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [selectedTeamMenu])

  const handleAddTeam = (newTeam: Team) => {
    const team: Team = {
      ...newTeam,
      id: Math.max(...teams.map(t => t.id || 0), 0) + 1,
      status: "active",
    }
    setTeams([...teams, team])
  }

  const handleEditTeam = (updatedTeam: Team) => {
    if (updatedTeam.id) {
      setTeams(teams.map(t => t.id === updatedTeam.id ? { ...updatedTeam, id: updatedTeam.id } as Team : t))
    }
    setEditingTeam(null)
  }

  const handleToggleStatus = (team: Team) => {
    setTeams(teams.map(t =>
      t.id === team.id ? { ...t, status: t.status === "active" ? "inactive" : "active" } : t
    ))
    setSelectedTeamMenu(null)
  }

  const handleDeleteTeam = () => {
    if (deletingTeam && deleteConfirmation === deletingTeam.name) {
      setTeams(teams.filter(t => t.id !== deletingTeam.id))
      setDeletingTeam(null)
      setDeleteConfirmation("")
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Teams</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your teams and team members
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.filter(t => t.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">
              {teams.filter(t => t.status === "inactive").length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams.filter(t => t.status === "active").reduce((sum, team) => sum + team.memberCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              In active teams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Team Size</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams.filter(t => t.status === "active").length > 0
                ? Math.round(teams.filter(t => t.status === "active").reduce((sum, team) => sum + team.memberCount, 0) / teams.filter(t => t.status === "active").length)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Members per active team
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Teams List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Teams</CardTitle>
              <CardDescription>
                {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInactive(!showInactive)}
            >
              {showInactive ? "Hide" : "Show"} Inactive
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.map((team) => (
                <TableRow
                  key={team.id}
                  onClick={() => setEditingTeam(team)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell className="text-muted-foreground">{team.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-muted-foreground" />
                      {team.memberCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={team.status === "active" ? "success" : "secondary"}>
                      {team.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(team.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="relative inline-block">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (team.id !== undefined) {
                            setSelectedTeamMenu(selectedTeamMenu === team.id ? null : team.id)
                          }
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {team.id !== undefined && selectedTeamMenu === team.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-[#212121] ring-1 ring-black dark:ring-[#383838] ring-opacity-5 z-50">
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingTeam(team)
                                setSelectedTeamMenu(null)
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#292929] cursor-pointer"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleStatus(team)
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#292929] cursor-pointer"
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
                                setDeletingTeam(team)
                                setSelectedTeamMenu(null)
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTeams.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UsersIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No teams found</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {showInactive
                  ? "You don't have any teams yet."
                  : "No active teams. Try showing inactive teams."}
              </p>
              {!showInactive && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Team
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Team Dialog */}
      <TeamFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddTeam}
        availablePeople={mockPeople}
      />

      {/* Edit Team Dialog */}
      <TeamFormDialog
        open={!!editingTeam}
        onOpenChange={(open) => !open && setEditingTeam(null)}
        team={editingTeam}
        onSave={handleEditTeam}
        availablePeople={mockPeople}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingTeam} onOpenChange={(open) => !open && setDeletingTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this team and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="confirmDelete">
                Type <strong>{deletingTeam?.name}</strong> to confirm
              </Label>
              <Input
                id="confirmDelete"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type team name to confirm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeletingTeam(null)
              setDeleteConfirmation("")
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTeam}
              disabled={deleteConfirmation !== deletingTeam?.name}
            >
              Delete Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
