"use client"

import { useState } from "react"
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
import { Plus, User, MoreHorizontal, Pencil, Trash2, UserX, UserCheck } from "lucide-react"
import { PersonFormDialog } from "@/components/person-form-dialog"

interface Person {
  id: number
  name: string
  role: string
  level: string
  startDate: string
  status: "active" | "inactive"
  teams: string[]
  notes?: string
}

// Mock data
const initialPeople: Person[] = [
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
  const [people, setPeople] = useState<Person[]>(initialPeople)
  const [showInactive, setShowInactive] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [selectedPersonMenu, setSelectedPersonMenu] = useState<number | null>(null)

  const filteredPeople = showInactive
    ? people
    : people.filter(person => person.status === "active")

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Calculate stats
  const getLevelCounts = () => {
    const counts: { [key: string]: number } = {}
    people.forEach(person => {
      const level = person.level || 'Unknown'
      counts[level] = (counts[level] || 0) + 1
    })
    return counts
  }

  const getRecentHires = () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    return people.filter(person => {
      const startDate = new Date(person.startDate)
      return startDate >= thirtyDaysAgo
    }).length
  }

  const levelCounts = getLevelCounts()
  const recentHiresCount = getRecentHires()

  const handleAddPerson = (newPerson: Omit<Person, "id">) => {
    const person: Person = {
      ...newPerson,
      id: Math.max(...people.map(p => p.id), 0) + 1,
      status: "active",
    }
    setPeople([...people, person])
  }

  const handleEditPerson = (updatedPerson: Person) => {
    setPeople(people.map(p => p.id === updatedPerson.id ? updatedPerson : p))
    setEditingPerson(null)
  }

  const handleToggleStatus = (person: Person) => {
    setPeople(people.map(p =>
      p.id === person.id ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p
    ))
    setSelectedPersonMenu(null)
  }

  const handleDeletePerson = () => {
    if (deletingPerson && deleteConfirmation === deletingPerson.name) {
      setPeople(people.filter(p => p.id !== deletingPerson.id))
      setDeletingPerson(null)
      setDeleteConfirmation("")
    }
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
        <Button onClick={() => setIsAddDialogOpen(true)}>
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
            <div className="flex gap-2 flex-wrap">
              {Object.entries(levelCounts).length > 0 ? (
                Object.entries(levelCounts).map(([level, count]) => (
                  <Badge key={level} variant="outline">{level}: {count}</Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No people yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Hires</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentHiresCount}</div>
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
                <TableRow
                  key={person.id}
                  onClick={() => setEditingPerson(person)}
                  className="cursor-pointer"
                >
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
                    <div className="relative inline-block">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPersonMenu(selectedPersonMenu === person.id ? null : person.id)
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {selectedPersonMenu === person.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingPerson(person)
                                setSelectedPersonMenu(null)
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleStatus(person)
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
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
                                setDeletingPerson(person)
                                setSelectedPersonMenu(null)
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
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
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Person
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Person Dialog */}
      <PersonFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddPerson}
      />

      {/* Edit Person Dialog */}
      <PersonFormDialog
        open={!!editingPerson}
        onOpenChange={(open) => !open && setEditingPerson(null)}
        person={editingPerson}
        onSave={handleEditPerson}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingPerson} onOpenChange={(open) => !open && setDeletingPerson(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Person</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this person and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="confirmDelete">
                Type <strong>{deletingPerson?.name}</strong> to confirm
              </Label>
              <Input
                id="confirmDelete"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type person name to confirm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeletingPerson(null)
              setDeleteConfirmation("")
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePerson}
              disabled={deleteConfirmation !== deletingPerson?.name}
            >
              Delete Person
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
