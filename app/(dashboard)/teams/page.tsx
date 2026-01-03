"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users as UsersIcon } from "lucide-react"
import { TeamFormDialog } from "@/components/team-form-dialog"
import { TeamsTable, Team } from "@/components/teams-table"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { mockTeams, mockPeople } from "@/lib/mock-data"

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>(mockTeams)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null)

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
    if (deletingTeam) {
      setTeams(teams.filter(t => t.id !== deletingTeam.id))
      setDeletingTeam(null)
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
          Add Team
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
      <DeleteConfirmDialog
        open={!!deletingTeam}
        onOpenChange={(open) => !open && setDeletingTeam(null)}
        onConfirm={handleDeleteTeam}
        itemName={deletingTeam?.name || ""}
        itemType="Team"
        description="This action cannot be undone. This will permanently delete this team and remove all associated data."
      />
    </div>
  )
}
