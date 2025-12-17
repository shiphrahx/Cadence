"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Users as UsersIcon, MoreHorizontal } from "lucide-react"

// Mock data
const mockTeams = [
  {
    id: 1,
    name: "Platform Engineering",
    description: "Core platform and infrastructure team",
    status: "active",
    memberCount: 8,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Product Development",
    description: "Customer-facing product features",
    status: "active",
    memberCount: 7,
    createdAt: "2024-02-01",
  },
  {
    id: 3,
    name: "Mobile Team",
    description: "iOS and Android applications",
    status: "inactive",
    memberCount: 5,
    createdAt: "2023-11-10",
  },
]

export default function TeamsPage() {
  const [teams] = useState(mockTeams)
  const [showInactive, setShowInactive] = useState(false)

  const filteredTeams = showInactive
    ? teams
    : teams.filter(team => team.status === "active")

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600 mt-1">
            Manage your teams and team members
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground">
              {teams.filter(t => t.status === "active").length} active
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
              {teams.reduce((sum, team) => sum + team.memberCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all teams
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
              {Math.round(teams.reduce((sum, team) => sum + team.memberCount, 0) / teams.length)}
            </div>
            <p className="text-xs text-muted-foreground">
              Members per team
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
                <TableRow key={team.id}>
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
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTeams.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UsersIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No teams found</h3>
              <p className="text-sm text-gray-600 mb-4">
                {showInactive
                  ? "You don't have any teams yet."
                  : "No active teams. Try showing inactive teams."}
              </p>
              {!showInactive && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Team
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
