"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Person {
  id?: number
  name: string
  role: string
  level: string
  startDate: string
  status: string
  teams: string[]
  notes?: string
}

interface PersonFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  person?: Person | null
  onSave: (person: Person) => void
}

const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

export function PersonFormDialog({ open, onOpenChange, person, onSave }: PersonFormDialogProps) {
  const [formData, setFormData] = useState<Person>(person || emptyPerson)

  // Reset form data when dialog opens/closes or person changes
  useEffect(() => {
    if (open) {
      setFormData(person || emptyPerson)
    }
  }, [open, person])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onOpenChange(false)
  }

  const isEditing = !!person

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? `Edit ${person?.name}` : "Add New Team Member"}</DialogTitle>
            <DialogDescription>
              {isEditing ? `Update ${person?.name}'s details below.` : "Add a new team member to your organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                  variant={formData.level === "Junior" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, level: "Junior" })}
                >
                  Junior
                </Button>
                <Button
                  type="button"
                  variant={formData.level === "Mid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, level: "Mid" })}
                >
                  Mid
                </Button>
                <Button
                  type="button"
                  variant={formData.level === "Senior" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, level: "Senior" })}
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
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
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
