"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Meeting {
  id?: number
  title: string
  type: string
  date: string
  attendees: string[]
  status: "upcoming" | "completed" | "cancelled"
  notes?: string
}

interface MeetingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting?: Meeting | null
  onSave: (meeting: Meeting) => void
}

const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const emptyMeeting: Meeting = {
  title: "",
  type: "1:1",
  date: getTodayDate(),
  attendees: [],
  status: "upcoming",
  notes: ""
}

const meetingTypes = [
  "1:1",
  "Team Sync",
  "Retro",
  "Planning",
  "Review",
  "Standup",
  "All Hands",
  "Other"
]

export function MeetingFormDialog({ open, onOpenChange, meeting, onSave }: MeetingFormDialogProps) {
  const [formData, setFormData] = useState<Meeting>(meeting || emptyMeeting)

  // Reset form data when dialog opens/closes or meeting changes
  useEffect(() => {
    if (open) {
      setFormData(meeting || emptyMeeting)
    }
  }, [open, meeting])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onOpenChange(false)
  }

  const isEditing = !!meeting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1100px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? meeting?.title : "Schedule New Meeting"}</DialogTitle>
            <DialogDescription>
              {isEditing ? `Update details below.` : "Create a new meeting."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Left Column - Form Fields */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Meeting Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 1:1 with Sarah Miller"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Meeting Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select meeting type" />
                  </SelectTrigger>
                  <SelectContent>
                    {meetingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="attendees">Attendees</Label>
                <Input
                  id="attendees"
                  value={formData.attendees.join(", ")}
                  onChange={(e) => setFormData({
                    ...formData,
                    attendees: e.target.value.split(",").map(a => a.trim()).filter(a => a.length > 0)
                  })}
                  placeholder="Enter names separated by commas"
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple attendees with commas
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "upcoming" | "completed" | "cancelled") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column - Notes */}
            <div className="flex flex-col">
              <Label htmlFor="notes" className="mb-2">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Meeting notes... (Markdown supported)"
                className="flex-1 resize-none font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Markdown formatting is supported
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Save Changes" : "Schedule Meeting"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
