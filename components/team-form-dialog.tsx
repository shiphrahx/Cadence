"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface Person {
  id: number
  name: string
}

interface Team {
  id?: number
  name: string
  description: string
  status: "active" | "inactive"
  memberCount: number
  createdAt: string
  memberIds?: number[]
  notes?: string
}

interface TeamFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team?: Team | null
  onSave: (team: Team) => void
  availablePeople?: Person[]
}

const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const emptyTeam: Team = {
  name: "",
  description: "",
  status: "active",
  memberCount: 0,
  createdAt: getTodayDate(),
  memberIds: [],
  notes: ""
}

export function TeamFormDialog({ open, onOpenChange, team, onSave, availablePeople = [] }: TeamFormDialogProps) {
  const [formData, setFormData] = useState<Team>(team || emptyTeam)
  const [searchQuery, setSearchQuery] = useState("")

  // Reset form data when dialog opens/closes or team changes
  useEffect(() => {
    if (open) {
      setFormData(team || emptyTeam)
      setSearchQuery("")
    }
  }, [open, team])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const teamData = {
      ...formData,
      memberCount: formData.memberIds?.length || 0
    }
    onSave(teamData)
    onOpenChange(false)
  }

  const isEditing = !!team

  const selectedMembers = availablePeople.filter(person =>
    formData.memberIds?.includes(person.id)
  )

  const filteredAvailablePeople = availablePeople.filter(person =>
    !formData.memberIds?.includes(person.id) &&
    person.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddMember = (personId: number) => {
    setFormData({
      ...formData,
      memberIds: [...(formData.memberIds || []), personId]
    })
    setSearchQuery("")
  }

  const handleRemoveMember = (personId: number) => {
    setFormData({
      ...formData,
      memberIds: formData.memberIds?.filter(id => id !== personId) || []
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? `Edit ${team?.name}` : "Create New Team"}</DialogTitle>
            <DialogDescription>
              {isEditing ? `Update ${team?.name}'s details below.` : "Add a new team to your organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Platform Engineering"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the team's focus..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Team Members</Label>
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedMembers.map((person) => (
                    <Badge key={person.id} variant="secondary" className="gap-1">
                      {person.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(person.id)}
                        className="ml-1 hover:bg-gray-300 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <Input
                placeholder="Search people to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && filteredAvailablePeople.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                  {filteredAvailablePeople.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => handleAddMember(person.id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {person.name}
                    </button>
                  ))}
                </div>
              )}
              {searchQuery && filteredAvailablePeople.length === 0 && (
                <p className="text-sm text-gray-500 px-3 py-2">No people found</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Save Changes" : "Create Team"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
