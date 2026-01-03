"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Plus, User } from "lucide-react"
import { PersonFormDialog } from "@/components/person-form-dialog"
import { PeopleTable, Person } from "@/components/people-table"

interface Team {
  id: number
  name: string
}

// Mock data - simplified team list for person assignment
const mockTeams: Team[] = [
  { id: 1, name: "Platform Engineering" },
  { id: 2, name: "Product Development" },
  { id: 3, name: "Mobile Team" },
]

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
  const router = useRouter()
  const [people, setPeople] = useState<Person[]>(initialPeople)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

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

  const handleAddPerson = (newPerson: Person) => {
    const person: Person = {
      ...newPerson,
      id: Math.max(...people.map(p => p.id || 0), 0) + 1,
      status: "active",
    }
    setPeople([...people, person])
  }

  const handleEditPerson = (updatedPerson: Person) => {
    if (updatedPerson.id) {
      setPeople(people.map(p => p.id === updatedPerson.id ? { ...updatedPerson, id: updatedPerson.id } as Person : p))
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">People</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
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
            <CardTitle className="text-sm font-medium">Active People</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{people.filter(p => p.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">
              {people.filter(p => p.status === "inactive").length} inactive
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

      {/* People Table */}
      <PeopleTable
        people={people}
        onRowClick={(person) => router.push(`/people/${person.id}`)}
        onEdit={(person) => setEditingPerson(person)}
        onDelete={(person) => setDeletingPerson(person)}
        onToggleStatus={handleToggleStatus}
        onQuickAdd={() => setIsAddDialogOpen(true)}
      />

      {/* Add Person Dialog */}
      <PersonFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddPerson}
        availableTeams={mockTeams}
      />

      {/* Edit Person Dialog */}
      <PersonFormDialog
        open={!!editingPerson}
        onOpenChange={(open) => !open && setEditingPerson(null)}
        person={editingPerson}
        onSave={handleEditPerson}
        availableTeams={mockTeams}
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
