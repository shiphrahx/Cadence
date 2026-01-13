"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users as UsersIcon } from "lucide-react"
import { TeamFormDialog } from "@/components/team-form-dialog"
import { TeamsTable } from "@/components/teams-table"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { mockPeople } from "@/lib/mock-data"
import { getTeams, createTeam, updateTeam, deleteTeam as deleteTeamService, toggleTeamStatus, type Team } from "@/lib/services/teams"

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load teams from Supabase on mount
  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    try {
      setIsLoading(true)
      const data = await getTeams()
      setTeams(data)
    } catch (error) {
      console.error('Failed to load teams:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTeam = async (newTeam: Team) => {
    try {
      const team = await createTeam(newTeam)
      setTeams([...teams, team])
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Failed to create team:', error)
    }
  }

  const handleEditTeam = async (updatedTeam: Team) => {
    try {
      const team = await updateTeam(updatedTeam.id, updatedTeam)
      setTeams(teams.map(t => t.id === team.id ? team : t))
      setEditingTeam(null)
    } catch (error) {
      console.error('Failed to update team:', error)
    }
  }

  const handleToggleStatus = async (team: Team) => {
    try {
      const updatedTeam = await toggleTeamStatus(team.id, team.status)
      setTeams(teams.map(t => t.id === updatedTeam.id ? updatedTeam : t))
    } catch (error) {
      console.error('Failed to toggle team status:', error)
    }
  }

  const handleDeleteTeam = async () => {
    if (deletingTeam) {
      try {
        await deleteTeamService(deletingTeam.id)
        setTeams(teams.filter(t => t.id !== deletingTeam.id))
        setDeletingTeam(null)
      } catch (error) {
        console.error('Failed to delete team:', error)
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-100 font-bold">Teams</h1>
          <p className="text-gray-400 mt-1">
            Manage your teams and team members
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Team
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.filter(t => t.status === "active").length}</div>
            <p className="text-muted-foreground">
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
            <p className="text-muted-foreground">
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
            <p className="text-muted-foreground">
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
