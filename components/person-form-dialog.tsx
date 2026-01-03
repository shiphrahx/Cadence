"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { getTodayDate } from "@/lib/utils"
import { type Team, type Person } from "@/lib/mock-data"

interface PersonFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  person?: Person | null
  onSave: (person: Person) => void
  availableTeams?: Team[]
}

const emptyPerson: Person = {
  name: "",
  role: "",
  level: "",
  startDate: getTodayDate(),
  status: "active",
  teams: [],
  notes: ""
}

export function PersonFormDialog({ open, onOpenChange, person, onSave, availableTeams = [] }: PersonFormDialogProps) {
  const [formData, setFormData] = useState<Person>(person || emptyPerson)
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  // Reset form data when dialog opens/closes or person changes
  useEffect(() => {
    if (open) {
      setFormData(person || emptyPerson)
      setSelectedAvailable([])
      setSelectedTeams([])
    }
  }, [open, person])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onOpenChange(false)
  }

  const isEditing = !!person

  const availableTeamsList = availableTeams.filter(team =>
    !formData.teams.includes(team.name)
  )

  const personTeamsList = availableTeams.filter(team =>
    formData.teams.includes(team.name)
  )

  const handleAddToTeams = () => {
    setFormData({
      ...formData,
      teams: [...formData.teams, ...selectedAvailable]
    })
    setSelectedAvailable([])
  }

  const handleRemoveFromTeams = () => {
    setFormData({
      ...formData,
      teams: formData.teams.filter(team => !selectedTeams.includes(team))
    })
    setSelectedTeams([])
  }

  const toggleAvailableSelection = (teamName: string) => {
    setSelectedAvailable(prev =>
      prev.includes(teamName)
        ? prev.filter(name => name !== teamName)
        : [...prev, teamName]
    )
  }

  const toggleTeamSelection = (teamName: string) => {
    setSelectedTeams(prev =>
      prev.includes(teamName)
        ? prev.filter(name => name !== teamName)
        : [...prev, teamName]
    )
  }

  const handleDoubleClickAvailable = (teamName: string) => {
    setFormData({
      ...formData,
      teams: [...formData.teams, teamName]
    })
    setSelectedAvailable(prev => prev.filter(name => name !== teamName))
  }

  const handleDoubleClickTeam = (teamName: string) => {
    setFormData({
      ...formData,
      teams: formData.teams.filter(team => team !== teamName)
    })
    setSelectedTeams(prev => prev.filter(name => name !== teamName))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1100px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? person?.name : "Add New Team Member"}</DialogTitle>
            <DialogDescription>
              {isEditing ? `Update details below.` : "Add a new team member to your organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Left Column - Form Fields */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Miller"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role / Title</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div className="grid gap-2">
                <Label>Level / Seniority</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, level: "Junior" })}
                    className={formData.level === "Junior" ? "!bg-green-100 !text-green-700 !border-green-300 hover:!bg-green-200" : "hover:!bg-green-50"}
                  >
                    Junior
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, level: "Mid" })}
                    className={formData.level === "Mid" ? "!bg-yellow-100 !text-yellow-700 !border-yellow-300 hover:!bg-yellow-200" : "hover:!bg-yellow-50"}
                  >
                    Mid
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, level: "Senior" })}
                    className={formData.level === "Senior" ? "!bg-pink-100 !text-pink-700 !border-pink-300 hover:!bg-pink-200" : "hover:!bg-pink-50"}
                  >
                    Senior
                  </Button>
                </div>
                <Input
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="Or enter custom level..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Teams</Label>
                <div className="flex gap-3 items-center">
                  {/* Available Teams */}
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600 mb-1">Available Teams</Label>
                    <div className="border border-gray-300 rounded-md h-32 overflow-y-auto">
                      {availableTeamsList.length > 0 ? (
                        availableTeamsList.map((team) => (
                          <div
                            key={team.id}
                            onClick={() => toggleAvailableSelection(team.name)}
                            onDoubleClick={() => handleDoubleClickAvailable(team.name)}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 select-none ${
                              selectedAvailable.includes(team.name) ? 'bg-primary-50 border-l-2 border-primary-600' : ''
                            }`}
                          >
                            {team.name}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full text-sm text-gray-500">
                          All teams assigned
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
                      onClick={handleAddToTeams}
                      disabled={selectedAvailable.length === 0}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleRemoveFromTeams}
                      disabled={selectedTeams.length === 0}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Person Teams */}
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600 mb-1">{formData.name ? `${formData.name}'s Teams` : "Person's Teams"} ({personTeamsList.length})</Label>
                    <div className="border border-gray-300 rounded-md h-32 overflow-y-auto">
                      {personTeamsList.length > 0 ? (
                        personTeamsList.map((team) => (
                          <div
                            key={team.id}
                            onClick={() => toggleTeamSelection(team.name)}
                            onDoubleClick={() => handleDoubleClickTeam(team.name)}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 select-none ${
                              selectedTeams.includes(team.name) ? 'bg-primary-50 border-l-2 border-primary-600' : ''
                            }`}
                          >
                            {team.name}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full text-sm text-gray-500">
                          No teams yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Notes */}
            <div className="flex flex-col">
              <Label htmlFor="notes" className="mb-2">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                className="flex-1 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Save Changes" : "Add Team Member"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
