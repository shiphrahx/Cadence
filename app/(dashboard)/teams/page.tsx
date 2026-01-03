"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Users as UsersIcon } from "lucide-react"
import { TeamFormDialog } from "@/components/team-form-dialog"
import { TeamsTable, Team } from "@/components/teams-table"

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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

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

      {/* Teams Table */}
      <TeamsTable
        teams={teams}
        onEdit={(team) => setEditingTeam(team)}
        onDelete={(team) => setDeletingTeam(team)}
        onToggleStatus={handleToggleStatus}
        onQuickAdd={() => setIsAddDialogOpen(true)}
      />

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
