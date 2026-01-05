"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, User } from "lucide-react"
import { PersonFormDialog } from "@/components/person-form-dialog"
import { PeopleTable } from "@/components/people-table"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { mockTeams } from "@/lib/mock-data"
import { getPeople, createPerson, updatePerson, deletePerson as deletePersonService, togglePersonStatus, type Person } from "@/lib/services/people"

export default function PeoplePage() {
  const router = useRouter()
  const [people, setPeople] = useState<Person[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load people from Supabase on mount
  useEffect(() => {
    loadPeople()
  }, [])

  const loadPeople = async () => {
    try {
      setIsLoading(true)
      const data = await getPeople()
      setPeople(data)
    } catch (error) {
      console.error('Failed to load people:', error)
    } finally {
      setIsLoading(false)
    }
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
      if (!person.startDate) return false
      const startDate = new Date(person.startDate)
      return startDate >= thirtyDaysAgo
    }).length
  }

  const levelCounts = getLevelCounts()
  const recentHiresCount = getRecentHires()

  const handleAddPerson = async (newPerson: Person) => {
    try {
      const person = await createPerson(newPerson)
      setPeople([...people, person])
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Failed to create person:', error)
    }
  }

  const handleEditPerson = async (updatedPerson: Person) => {
    try {
      const person = await updatePerson(updatedPerson.id, updatedPerson)
      setPeople(people.map(p => p.id === person.id ? person : p))
      setEditingPerson(null)
    } catch (error) {
      console.error('Failed to update person:', error)
    }
  }

  const handleToggleStatus = async (person: Person) => {
    try {
      const updatedPerson = await togglePersonStatus(person.id, person.status)
      setPeople(people.map(p => p.id === updatedPerson.id ? updatedPerson : p))
    } catch (error) {
      console.error('Failed to toggle person status:', error)
    }
  }

  const handleDeletePerson = async () => {
    if (deletingPerson) {
      try {
        await deletePersonService(deletingPerson.id)
        setPeople(people.filter(p => p.id !== deletingPerson.id))
        setDeletingPerson(null)
      } catch (error) {
        console.error('Failed to delete person:', error)
      }
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
      <DeleteConfirmDialog
        open={!!deletingPerson}
        onOpenChange={(open) => !open && setDeletingPerson(null)}
        onConfirm={handleDeletePerson}
        itemName={deletingPerson?.name || ""}
        itemType="Person"
        description="This action cannot be undone. This will permanently delete this person and remove all associated data."
      />
    </div>
  )
}
