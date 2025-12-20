"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownTextarea } from "@/components/ui/markdown-textarea"
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
  actionItems?: string
  notes?: string
  personName?: string
  recurrence?: string
  nextMeetingDate?: string
}

interface MeetingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting?: Meeting | null
  onSave: (meeting: Meeting) => void
  availablePeople?: string[]
  availableTeams?: string[]
}

const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const calculateNextMeetingDate = (lastMeetingDate: string, recurrence: string): string => {
  const date = new Date(lastMeetingDate)

  switch (recurrence) {
    case "weekly":
      date.setDate(date.getDate() + 7)
      break
    case "fortnightly":
      date.setDate(date.getDate() + 14)
      break
    case "monthly":
      date.setMonth(date.getMonth() + 1)
      break
    case "quarterly":
      date.setMonth(date.getMonth() + 3)
      break
    default:
      return ""
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const emptyMeeting: Meeting = {
  title: "",
  type: "1:1",
  date: getTodayDate(),
  attendees: [],
  actionItems: "",
  notes: "",
  recurrence: "weekly",
  nextMeetingDate: ""
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

const recurrenceOptions = [
  { value: "none", label: "No recurrence" },
  { value: "weekly", label: "Weekly" },
  { value: "fortnightly", label: "Fortnightly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
]

export function MeetingFormDialog({ open, onOpenChange, meeting, onSave, availablePeople = [], availableTeams = [] }: MeetingFormDialogProps) {
  const [formData, setFormData] = useState<Meeting>(meeting || emptyMeeting)
  const [personInput, setPersonInput] = useState("")
  const [filteredPeople, setFilteredPeople] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [teamInput, setTeamInput] = useState("")
  const [filteredTeams, setFilteredTeams] = useState<string[]>([])
  const [showTeamSuggestions, setShowTeamSuggestions] = useState(false)
  const [validationError, setValidationError] = useState("")

  // Reset form data when dialog opens/closes or meeting changes
  useEffect(() => {
    if (open) {
      const initialData = meeting || emptyMeeting
      setFormData(initialData)
      setPersonInput(initialData.personName || "")
      setTeamInput(initialData.attendees?.[0] || "")
      setValidationError("")

      // Calculate next meeting date if recurrence is set
      if (initialData.recurrence && initialData.recurrence !== "none") {
        const nextDate = calculateNextMeetingDate(initialData.date, initialData.recurrence)
        setFormData(prev => ({ ...prev, nextMeetingDate: nextDate }))
      }
    }
  }, [open, meeting])

  // Update next meeting date when date or recurrence changes
  useEffect(() => {
    if (formData.recurrence && formData.recurrence !== "none" && formData.date) {
      const nextDate = calculateNextMeetingDate(formData.date, formData.recurrence)
      setFormData(prev => ({ ...prev, nextMeetingDate: nextDate }))
    } else {
      setFormData(prev => ({ ...prev, nextMeetingDate: "" }))
    }
  }, [formData.date, formData.recurrence])

  // Filter people as user types
  useEffect(() => {
    if (personInput && formData.type === "1:1") {
      const filtered = availablePeople.filter(person =>
        person.toLowerCase().includes(personInput.toLowerCase())
      )
      setFilteredPeople(filtered)
      setShowSuggestions(filtered.length > 0 && personInput.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [personInput, availablePeople, formData.type])

  // Filter teams as user types
  useEffect(() => {
    const teamBasedTypes = ["Team Sync", "Retro", "Planning", "Review", "Standup"]
    if (teamInput && teamBasedTypes.includes(formData.type)) {
      const filtered = availableTeams.filter(team =>
        team.toLowerCase().includes(teamInput.toLowerCase())
      )
      setFilteredTeams(filtered)
      setShowTeamSuggestions(filtered.length > 0 && teamInput.length > 0)
    } else {
      setShowTeamSuggestions(false)
    }
  }, [teamInput, availableTeams, formData.type])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError("")

    // Validate next meeting date is after meeting date
    if (formData.nextMeetingDate && formData.date) {
      const meetingDate = new Date(formData.date)
      const nextMeetingDate = new Date(formData.nextMeetingDate)
      if (nextMeetingDate <= meetingDate) {
        setValidationError("Next meeting date must be after the meeting date")
        return
      }
    }

    // For 1:1 meetings, set personName and attendees
    if (formData.type === "1:1") {
      const meetingData = {
        ...formData,
        personName: personInput,
        attendees: [personInput],
        title: `1:1 with ${personInput}`
      }
      onSave(meetingData)
    } else if (["Team Sync", "Retro", "Planning", "Review", "Standup"].includes(formData.type)) {
      // For team-based meetings
      const meetingData = {
        ...formData,
        attendees: [teamInput],
        title: formData.title || `${formData.type} - ${teamInput}`
      }
      onSave(meetingData)
    } else {
      onSave(formData)
    }

    onOpenChange(false)
  }

  const handlePersonSelect = (person: string) => {
    setPersonInput(person)
    setFormData({ ...formData, personName: person, attendees: [person] })
    setShowSuggestions(false)
  }

  const handleTeamSelect = (team: string) => {
    setTeamInput(team)
    setFormData({ ...formData, attendees: [team] })
    setShowTeamSuggestions(false)
  }

  const isEditing = !!meeting
  const is1on1 = formData.type === "1:1"
  const isTeamBased = ["Team Sync", "Retro", "Planning", "Review", "Standup"].includes(formData.type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1100px] max-h-[90vh]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? meeting?.title : "Log Meeting"}</DialogTitle>
            <DialogDescription>
              {isEditing ? `Update meeting details and notes.` : "Add meeting details and notes."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)] px-1">
            {/* Left Column - Form Fields */}
            <div className="grid gap-3 pr-1">
              {/* Conditional Fields based on Meeting Type */}
              {is1on1 ? (
                <>
                  {/* Meeting Type and Date side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Meeting Type *</Label>
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

                    {/* Date Field for 1:1 */}
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Person Field for 1:1 */}
                  <div className="grid gap-2">
                    <Label htmlFor="person">Person *</Label>
                    <div className="relative">
                      <Input
                        id="person"
                        value={personInput}
                        onChange={(e) => setPersonInput(e.target.value)}
                        onFocus={() => setShowSuggestions(filteredPeople.length > 0)}
                        placeholder="Start typing a name..."
                        required
                      />
                      {showSuggestions && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {filteredPeople.map((person, index) => (
                            <div
                              key={index}
                              onClick={() => handlePersonSelect(person)}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                            >
                              {person}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select from your team or type a new name
                    </p>
                  </div>

                  {/* Recurrence and Next Meeting - Side by Side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="recurrence">Recurrence</Label>
                      <Select
                        value={formData.recurrence || "none"}
                        onValueChange={(value) => setFormData({ ...formData, recurrence: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select recurrence" />
                        </SelectTrigger>
                        <SelectContent>
                          {recurrenceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.recurrence && formData.recurrence !== "none" && (
                      <div className="grid gap-2">
                        <Label htmlFor="nextMeetingDate">Next Meeting</Label>
                        <Input
                          id="nextMeetingDate"
                          type="date"
                          value={formData.nextMeetingDate || ""}
                          onChange={(e) => setFormData({ ...formData, nextMeetingDate: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : isTeamBased ? (
                <>
                  {/* Meeting Type and Date side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Meeting Type *</Label>
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

                    {/* Date Field for team-based meetings */}
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Team Field for team-based meetings */}
                  <div className="grid gap-2">
                    <Label htmlFor="team">Team *</Label>
                    <div className="relative">
                      <Input
                        id="team"
                        value={teamInput}
                        onChange={(e) => setTeamInput(e.target.value)}
                        onFocus={() => setShowTeamSuggestions(filteredTeams.length > 0)}
                        placeholder="Start typing a team name..."
                        required
                      />
                      {showTeamSuggestions && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {filteredTeams.map((team, index) => (
                            <div
                              key={index}
                              onClick={() => handleTeamSelect(team)}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                            >
                              {team}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select from your teams or type a new name
                    </p>
                  </div>

                  {/* Recurrence and Next Meeting - Side by Side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="recurrence">Recurrence</Label>
                      <Select
                        value={formData.recurrence || "none"}
                        onValueChange={(value) => setFormData({ ...formData, recurrence: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select recurrence" />
                        </SelectTrigger>
                        <SelectContent>
                          {recurrenceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.recurrence && formData.recurrence !== "none" && (
                      <div className="grid gap-2">
                        <Label htmlFor="nextMeetingDate">Next Meeting</Label>
                        <Input
                          id="nextMeetingDate"
                          type="date"
                          value={formData.nextMeetingDate || ""}
                          onChange={(e) => setFormData({ ...formData, nextMeetingDate: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  {/* Meeting Title */}
                  <div className="grid gap-2">
                    <Label htmlFor="title">Meeting Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={`e.g. ${formData.type} - ${teamInput || "Team Name"}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave blank to auto-generate from type and team
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Meeting Type and Date side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Meeting Type *</Label>
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

                    {/* Date Field for other meetings */}
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Meeting Title for other meetings */}
                  <div className="grid gap-2">
                    <Label htmlFor="title">Meeting Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. All Hands Q4 2024"
                      required
                    />
                  </div>

                  {/* Attendees for other meetings */}
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
                </>
              )}

              {/* Action Items */}
              <div className="grid gap-2">
                <Label htmlFor="actionItems">Action Items</Label>
                <MarkdownTextarea
                  id="actionItems"
                  value={formData.actionItems}
                  onValueChange={(value) => setFormData({ ...formData, actionItems: value })}
                  placeholder={"- Action item 1\n- Action item 2\n- Action item 3"}
                  rows={6}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Right Column - Notes */}
            <div className="flex flex-col pl-1">
              <Label htmlFor="notes" className="mb-2">Notes</Label>
              <div className="flex-1">
                <MarkdownTextarea
                  id="notes"
                  value={formData.notes}
                  onValueChange={(value) => setFormData({ ...formData, notes: value })}
                  placeholder="Meeting notes, discussion points, decisions..."
                  className="h-full resize-none text-sm"
                />
              </div>
            </div>
          </div>
          {validationError && (
            <div className="px-6 pb-2">
              <p className="text-sm text-red-600">{validationError}</p>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Save Changes" : "Save Meeting"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
