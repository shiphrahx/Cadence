"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownTextarea } from "@/components/ui/markdown-textarea"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { getTodayDate } from "@/lib/utils"
import { type Team } from "@/lib/services/teams"
import { type Person } from "@/lib/mock-data"

interface TeamFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team?: Team | null
  onSave: (team: Team) => void
  availablePeople?: Person[]
}

const emptyTeam: Omit<Team, 'id' | 'createdAt'> & { id?: string; createdAt?: string } = {
  name: "",
  description: "",
  status: "active",
  memberCount: 0,
  memberIds: [],
  notes: "",
  documentationUrl: ""
}

export function TeamFormDialog({ open, onOpenChange, team, onSave, availablePeople = [] }: TeamFormDialogProps) {
  const [formData, setFormData] = useState<Team | typeof emptyTeam>(team || emptyTeam)
  const [selectedAvailable, setSelectedAvailable] = useState<number[]>([])
  const [selectedMembers, setSelectedMembers] = useState<number[]>([])

  // Reset form data when dialog opens/closes or team changes
  useEffect(() => {
    if (open) {
      setFormData(team || emptyTeam)
      setSelectedAvailable([])
      setSelectedMembers([])
    }
  }, [open, team])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const teamData = {
      ...formData,
      memberCount: formData.memberIds?.length || 0
    } as Team
    onSave(teamData)
    onOpenChange(false)
  }

  const isEditing = !!team

  const availablePeopleList = availablePeople.filter(person =>
    person.id !== undefined && !formData.memberIds?.includes(String(person.id))
  )

  const teamMembersList = availablePeople.filter(person =>
    person.id !== undefined && formData.memberIds?.includes(String(person.id))
  )

  const handleAddToTeam = () => {
    setFormData({
      ...formData,
      memberIds: [...(formData.memberIds || []), ...selectedAvailable.map(String)]
    })
    setSelectedAvailable([])
  }

  const handleRemoveFromTeam = () => {
    setFormData({
      ...formData,
      memberIds: formData.memberIds?.filter(id => !selectedMembers.map(String).includes(id)) || []
    })
    setSelectedMembers([])
  }

  const toggleAvailableSelection = (personId: number) => {
    setSelectedAvailable(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    )
  }

  const toggleMemberSelection = (personId: number) => {
    setSelectedMembers(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    )
  }

  const handleDoubleClickAvailable = (personId: number) => {
    setFormData({
      ...formData,
      memberIds: [...(formData.memberIds || []), String(personId)]
    })
    setSelectedAvailable(prev => prev.filter(id => id !== personId))
  }

  const handleDoubleClickMember = (personId: number) => {
    setFormData({
      ...formData,
      memberIds: formData.memberIds?.filter(id => id !== String(personId)) || []
    })
    setSelectedMembers(prev => prev.filter(id => id !== personId))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1100px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? team?.name : "Create New Team"}</DialogTitle>
            <DialogDescription>
              {isEditing ? `Update details below.` : "Add a new team to your organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Left Column - Form Fields */}
            <div className="grid gap-4">
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
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the team's focus..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="documentationUrl">Documentation Link</Label>
                <Input
                  id="documentationUrl"
                  value={formData.documentationUrl}
                  onChange={(e) => setFormData({ ...formData, documentationUrl: e.target.value })}
                  placeholder="e.g. Confluence, Notion, or Teams page URL"
                  type="url"
                />
              </div>
              <div className="grid gap-2">
                <Label>Team Members</Label>
                <div className="flex gap-3 items-center">
                  {/* Available People */}
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600 mb-1">Available People</Label>
                    <div className="border border-gray-300 rounded-md h-48 overflow-y-auto">
                      {availablePeopleList.length > 0 ? (
                        availablePeopleList.map((person) => (
                          <div
                            key={person.id}
                            onClick={() => toggleAvailableSelection(person.id!)}
                            onDoubleClick={() => handleDoubleClickAvailable(person.id!)}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 select-none ${
                              selectedAvailable.includes(person.id!) ? 'bg-primary-50 dark:bg-primary-dark-900/30 border-l-2 border-primary-600' : ''
                            }`}
                          >
                            {person.name}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full text-sm text-gray-500">
                          All people assigned
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrow Buttons */}
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddToTeam}
                      disabled={selectedAvailable.length === 0}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleRemoveFromTeam}
                      disabled={selectedMembers.length === 0}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Team Members */}
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600 mb-1">Team Members ({teamMembersList.length})</Label>
                    <div className="border border-gray-300 rounded-md h-48 overflow-y-auto">
                      {teamMembersList.length > 0 ? (
                        teamMembersList.map((person) => (
                          <div
                            key={person.id}
                            onClick={() => toggleMemberSelection(person.id!)}
                            onDoubleClick={() => handleDoubleClickMember(person.id!)}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 select-none ${
                              selectedMembers.includes(person.id!) ? 'bg-primary-50 dark:bg-primary-dark-900/30 border-l-2 border-primary-600' : ''
                            }`}
                          >
                            {person.name}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full text-sm text-gray-500">
                          No members yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Notes */}
            <div className="flex flex-col">
              <Label className="mb-2">Notes</Label>
              <MarkdownTextarea
                value={formData.notes}
                onValueChange={(value) => setFormData({ ...formData, notes: value })}
                placeholder="Any additional notes..."
                className="flex-1 resize-none"
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
