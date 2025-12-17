"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, User, MoreHorizontal } from "lucide-react"

// Mock data
const mockPeople = [
  {
    id: 1,
    name: "Sarah Miller",
    role: "Senior Software Engineer",
    level: "Senior",
    startDate: "2023-01-15",
    status: "active",
    teams: ["Platform Engineering"],
  },
  {
    id: 2,
    name: "John Doe",
    role: "Software Engineer",
    level: "Mid",
    startDate: "2023-06-01",
    status: "active",
    teams: ["Platform Engineering", "Product Development"],
  },
  {
    id: 3,
    name: "Emily Wong",
    role: "Tech Lead",
    level: "Staff",
    startDate: "2022-11-10",
    status: "active",
    teams: ["Product Development"],
  },
  {
    id: 4,
    name: "Mike Chen",
    role: "Software Engineer",
    level: "Junior",
    startDate: "2024-01-08",
    status: "active",
    teams: ["Product Development"],
  },
  {
    id: 5,
    name: "Alex Johnson",
    role: "iOS Developer",
    level: "Mid",
    startDate: "2023-03-20",
    status: "inactive",
    teams: ["Mobile Team"],
  },
]

export default function PeoplePage() {
  const [people] = useState(mockPeople)
  const [showInactive, setShowInactive] = useState(false)

  const filteredPeople = showInactive
    ? people
    : people.filter(person => person.status === "active")

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">People</h1>
          <p className="text-gray-600 mt-1">
            Manage your team members and their details
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total People</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{people.length}</div>
            <p className="text-xs text-muted-foreground">
              {people.filter(p => p.status === "active").length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">By Level</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Badge variant="outline">Junior: 1</Badge>
              <Badge variant="outline">Mid: 2</Badge>
              <Badge variant="outline">Senior+: 2</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Hires</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              In the last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* People List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All People</CardTitle>
              <CardDescription>
                {filteredPeople.length} {filteredPeople.length !== 1 ? 'people' : 'person'}
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
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPeople.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                        <span className="text-sm font-semibold">{getInitials(person.name)}</span>
                      </div>
                      <span className="font-medium">{person.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{person.role}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{person.level}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {person.teams.map((team, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {team}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(person.startDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={person.status === "active" ? "success" : "secondary"}>
                      {person.status}
                    </Badge>
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

          {filteredPeople.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No people found</h3>
              <p className="text-sm text-gray-600 mb-4">
                {showInactive
                  ? "You haven't added any team members yet."
                  : "No active people. Try showing inactive people."}
              </p>
              {!showInactive && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Person
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
