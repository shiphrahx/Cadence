"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarkdownTextarea } from "@/components/ui/markdown-textarea"
import { ChevronRight, ChevronLeft, ArrowLeft, ChevronDown, Plus } from "lucide-react"
import { MeetingFormDialog } from "@/components/meeting-form-dialog"

interface Team {
  id: number
  name: string
}

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

interface Meeting {
  id: number
  title: string
  type: string
  date: string
  attendees: string[]
  actionItems?: string
  notes?: string
  personName?: string
  teamName?: string
  recurrence?: string
  nextMeetingDate?: string
}

interface TreeNode {
  type: string
  meetings: Meeting[]
}

// Mock data - this should come from a shared data source or API
const mockTeams: Team[] = [
  { id: 1, name: "Platform Engineering" },
  { id: 2, name: "Product Development" },
  { id: 3, name: "Mobile Team" },
]

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

const seniorityLevels = ["Junior", "Mid", "Senior", "Staff", "Principal"]

// Mock meetings data - should come from shared source
const mockMeetings: Meeting[] = [
  {
    id: 1,
    title: "1:1 with Sarah Miller",
    type: "1:1",
    date: "2024-12-20",
    attendees: ["Sarah Miller"],
    personName: "Sarah Miller",
    recurrence: "weekly",
    nextMeetingDate: "2024-12-27",
    actionItems: "- Follow up on Q1 roadmap\n- Schedule design review",
    notes: "Discussed career progression and upcoming projects.",
  },
  {
    id: 2,
    title: "1:1 with Sarah Miller",
    type: "1:1",
    date: "2024-12-13",
    attendees: ["Sarah Miller"],
    personName: "Sarah Miller",
    recurrence: "weekly",
    notes: "Weekly check-in. Discussed current sprint progress.",
  },
  {
    id: 3,
    title: "Team Sync - Platform Engineering",
    type: "Team Sync",
    date: "2024-12-18",
    attendees: ["Platform Engineering"],
    teamName: "Platform Engineering",
    actionItems: "- Deploy new infrastructure\n- Update documentation",
    notes: "Discussed Q1 roadmap and priorities.",
  },
]

// Mock people and teams for meeting form
const mockPeople = ["Sarah Miller", "John Doe", "Jane Smith"]
const mockTeamsForMeetings = ["Platform Engineering", "Product Development", "Mobile Team"]

const getLevelBadgeClass = (level: string) => {
  switch (level) {
    case "Junior":
      return "bg-green-100 text-green-700 border-green-300"
    case "Mid":
      return "bg-yellow-100 text-yellow-700 border-yellow-300"
    case "Senior":
      return "bg-pink-100 text-pink-700 border-pink-300"
    case "Staff":
      return "bg-purple-100 text-purple-700 border-purple-300"
    case "Principal":
      return "bg-blue-100 text-blue-700 border-blue-300"
    default:
      return "bg-gray-100 text-gray-700 border-gray-300"
  }
}

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [personId, setPersonId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Person | null>(null)
  const [selectedAvailable, setSelectedAvailable] = useState<number[]>([])
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<number[]>([])

  // Meeting states
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(["1:1"]))
  const [isAddMeetingDialogOpen, setIsAddMeetingDialogOpen] = useState(false)
  const [leftPanelWidth, setLeftPanelWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    // Unwrap params promise and set personId
    params.then(({ id }) => {
      setPersonId(parseInt(id))
    })
  }, [params])

  useEffect(() => {
    // Find the person by ID once personId is set
    if (personId !== null) {
      const person = initialPeople.find(p => p.id === personId)
      if (person) {
        setFormData(person)
      }
    }
  }, [personId])

  // Meeting helper functions and tree organization - MUST be before early return
  const tree = useMemo(() => {
    if (!formData) return {}

    // Filter meetings for this person
    const personMeetings = meetings.filter(meeting => {
      // Include 1:1 meetings with this person
      if (meeting.personName === formData.name) return true

      // Include team meetings where person is in the team
      if (meeting.teamName && formData.teams.includes(meeting.teamName)) return true

      // Include meetings where person is in attendees
      if (meeting.attendees.includes(formData.name)) return true

      return false
    })

    // Organize meetings into tree structure
    const treeStructure: { [type: string]: TreeNode } = {}

    personMeetings.forEach((meeting) => {
      if (!treeStructure[meeting.type]) {
        treeStructure[meeting.type] = {
          type: meeting.type,
          meetings: [],
        }
      }
      treeStructure[meeting.type].meetings.push(meeting)
    })

    // Sort meetings by date (most recent first)
    Object.values(treeStructure).forEach((node) => {
      node.meetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })

    return treeStructure
  }, [formData, meetings])

  // Mouse resize handling - MUST be before early return
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const meetingsSection = document.getElementById('meetings-section')
      if (!meetingsSection) return

      const sectionRect = meetingsSection.getBoundingClientRect()
      const newWidth = e.clientX - sectionRect.left

      if (newWidth >= 200 && newWidth <= 500) {
        setLeftPanelWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isResizing])

  const getPersonMeetings = (): Meeting[] => {
    return Object.values(tree).flatMap(node => node.meetings)
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Person not found</p>
      </div>
    )
  }

  const handleSave = () => {
    // TODO: Save the person data
    console.log("Saving person:", formData)
    router.push("/people")
  }

  const handleCancel = () => {
    router.push("/people")
  }

  const availableTeamsList = mockTeams.filter(team =>
    !formData.teams.includes(team.name)
  )

  const assignedTeamsList = mockTeams.filter(team =>
    formData.teams.includes(team.name)
  )

  const handleAddToTeams = () => {
    const teamsToAdd = mockTeams
      .filter(team => selectedAvailable.includes(team.id))
      .map(team => team.name)

    setFormData({
      ...formData,
      teams: [...formData.teams, ...teamsToAdd]
    })
    setSelectedAvailable([])
  }

  const handleRemoveFromTeams = () => {
    const teamsToRemove = mockTeams
      .filter(team => selectedTeamMembers.includes(team.id))
      .map(team => team.name)

    setFormData({
      ...formData,
      teams: formData.teams.filter(team => !teamsToRemove.includes(team))
    })
    setSelectedTeamMembers([])
  }

  const toggleAvailableSelection = (teamId: number) => {
    setSelectedAvailable(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    )
  }

  const toggleTeamMemberSelection = (teamId: number) => {
    setSelectedTeamMembers(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    )
  }

  const handleDoubleClickAvailable = (teamId: number) => {
    const team = mockTeams.find(t => t.id === teamId)
    if (team) {
      setFormData({
        ...formData,
        teams: [...formData.teams, team.name]
      })
      setSelectedAvailable(prev => prev.filter(id => id !== teamId))
    }
  }

  const handleDoubleClickTeamMember = (teamId: number) => {
    const team = mockTeams.find(t => t.id === teamId)
    if (team) {
      setFormData({
        ...formData,
        teams: formData.teams.filter(t => t !== team.name)
      })
      setSelectedTeamMembers(prev => prev.filter(id => id !== teamId))
    }
  }

  const toggleType = (type: string) => {
    const newExpanded = new Set(expandedTypes)
    if (newExpanded.has(type)) {
      newExpanded.delete(type)
    } else {
      newExpanded.add(type)
    }
    setExpandedTypes(newExpanded)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleAddMeeting = (newMeeting: Omit<Meeting, "id">) => {
    const teamBasedTypes = ["Team Sync", "Retro", "Planning", "Review", "Standup"]
    const meeting: Meeting = {
      ...newMeeting,
      id: Math.max(...meetings.map(m => m.id), 0) + 1,
      personName: newMeeting.type === "1:1" ? newMeeting.attendees[0] : undefined,
      teamName: teamBasedTypes.includes(newMeeting.type) ? newMeeting.attendees[0] : undefined,
    }
    setMeetings([...meetings, meeting])
    setSelectedMeeting(meeting)
  }

  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
    if (updatedMeeting.nextMeetingDate && updatedMeeting.date) {
      const meetingDate = new Date(updatedMeeting.date)
      const nextMeetingDate = new Date(updatedMeeting.nextMeetingDate)
      if (nextMeetingDate <= meetingDate) {
        alert("Next meeting date must be after the meeting date")
        return
      }
    }

    setMeetings(meetings.map(m => m.id === updatedMeeting.id ? updatedMeeting : m))
    setSelectedMeeting(updatedMeeting)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to People
        </Button>
        <h1 className="text-2xl font-bold">{formData.name}</h1>
        <p className="text-sm text-gray-600">{formData.role}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Miller"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Seniority Level *</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {seniorityLevels.map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, level })}
                      className={`text-xs border ${
                        formData.level === level
                          ? getLevelBadgeClass(level)
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {level}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, level: "" })}
                    className={`text-xs border ${
                      !seniorityLevels.includes(formData.level)
                        ? "bg-gray-100 text-gray-700 border-gray-300"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Other
                  </Button>
                </div>
                <Input
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="Or type custom level"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Teams</Label>
                <div className="flex gap-3 items-center">
                  {/* Available Teams */}
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600 mb-1">Available Teams</Label>
                    <div className="border border-gray-300 rounded-md h-48 overflow-y-auto bg-white">
                      {availableTeamsList.length > 0 ? (
                        availableTeamsList.map((team) => (
                          <div
                            key={team.id}
                            onClick={() => toggleAvailableSelection(team.id)}
                            onDoubleClick={() => handleDoubleClickAvailable(team.id)}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 select-none ${
                              selectedAvailable.includes(team.id) ? 'bg-primary-50 border-l-2 border-primary-600' : ''
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
                      disabled={selectedTeamMembers.length === 0}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Assigned Teams */}
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600 mb-1">Assigned Teams ({assignedTeamsList.length})</Label>
                    <div className="border border-gray-300 rounded-md h-48 overflow-y-auto bg-white">
                      {assignedTeamsList.length > 0 ? (
                        assignedTeamsList.map((team) => (
                          <div
                            key={team.id}
                            onClick={() => toggleTeamMemberSelection(team.id)}
                            onDoubleClick={() => handleDoubleClickTeamMember(team.id)}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 select-none ${
                              selectedTeamMembers.includes(team.id) ? 'bg-primary-50 border-l-2 border-primary-600' : ''
                            }`}
                          >
                            {team.name}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full text-sm text-gray-500">
                          No teams assigned
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
              <div className="flex-1">
                <MarkdownTextarea
                  id="notes"
                  value={formData.notes || ""}
                  onValueChange={(value) => setFormData({ ...formData, notes: value })}
                  placeholder="Any additional notes about this person..."
                  className="h-full resize-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Meetings Section */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Meetings</h2>
            <p className="text-sm text-gray-600 mt-1">All meetings involving {formData.name}</p>
          </div>

          <div id="meetings-section" className="flex h-[900px] border rounded-lg overflow-hidden">
            {/* Left Panel - Tree View */}
            <div
              className="border-r bg-white overflow-y-auto flex-shrink-0"
              style={{ width: `${leftPanelWidth}px` }}
            >
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Meeting History</h3>
                  <Button size="sm" onClick={() => setIsAddMeetingDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Log
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {getPersonMeetings().length} {getPersonMeetings().length === 1 ? 'meeting' : 'meetings'}
                </p>
              </div>

              <div className="p-2">
                {Object.keys(tree).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-gray-500 mb-4">No meetings logged yet</p>
                    <Button size="sm" onClick={() => setIsAddMeetingDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Log First Meeting
                    </Button>
                  </div>
                ) : (
                  Object.entries(tree).map(([type, node]) => (
                    <div key={type} className="mb-1">
                      {/* Meeting Type */}
                      <button
                        onClick={() => toggleType(type)}
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded"
                      >
                        {expandedTypes.has(type) ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                        {type} ({node.meetings.length})
                      </button>

                      {/* Meetings */}
                      {expandedTypes.has(type) && (
                        <div className="ml-4">
                          {node.meetings.map((meeting) => (
                            <button
                              key={meeting.id}
                              onClick={() => setSelectedMeeting(meeting)}
                              className={`block w-full text-left px-2 py-1.5 text-xs rounded ${
                                selectedMeeting?.id === meeting.id
                                  ? "bg-primary-50 text-primary-700 font-medium"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {formatDate(meeting.date)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Resizable Divider */}
            <div
              className={`w-1 bg-gray-200 hover:bg-primary-400 cursor-col-resize flex-shrink-0 ${
                isResizing ? 'bg-primary-500' : ''
              }`}
              onMouseDown={handleMouseDown}
            />

            {/* Right Panel - Meeting Details */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {selectedMeeting ? (
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Date and Next Meeting Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Date</Label>
                        <Input
                          type="date"
                          value={selectedMeeting.date}
                          onChange={(e) => handleUpdateMeeting({ ...selectedMeeting, date: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      {selectedMeeting.type === "1:1" && selectedMeeting.recurrence && selectedMeeting.recurrence !== "none" && selectedMeeting.nextMeetingDate && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Next Meeting</Label>
                          <Input
                            type="date"
                            value={selectedMeeting.nextMeetingDate}
                            onChange={(e) => handleUpdateMeeting({ ...selectedMeeting, nextMeetingDate: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>

                    {/* Title and Attendees */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Title</Label>
                        <Input
                          value={selectedMeeting.title}
                          onChange={(e) => handleUpdateMeeting({ ...selectedMeeting, title: e.target.value })}
                          placeholder="Meeting title"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Attendees</Label>
                        <Input
                          value={selectedMeeting.attendees.join(", ")}
                          onChange={(e) => handleUpdateMeeting({
                            ...selectedMeeting,
                            attendees: e.target.value.split(",").map(a => a.trim()).filter(a => a.length > 0)
                          })}
                          placeholder="Enter names separated by commas"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Action Items */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Action Items</Label>
                      <MarkdownTextarea
                        value={selectedMeeting.actionItems || ""}
                        onValueChange={(value) => handleUpdateMeeting({ ...selectedMeeting, actionItems: value })}
                        placeholder={"- Action item 1\n- Action item 2"}
                        rows={4}
                        className="mt-1 text-sm"
                      />
                    </div>

                    {/* Meeting Notes */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Meeting Notes</Label>
                      <MarkdownTextarea
                        value={selectedMeeting.notes || ""}
                        onValueChange={(value) => handleUpdateMeeting({ ...selectedMeeting, notes: value })}
                        placeholder="Meeting notes, discussion points, decisions..."
                        rows={8}
                        className="mt-1 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Select a meeting to view details</p>
                    <p className="text-xs text-gray-400">or log a new meeting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Form Dialog */}
      <MeetingFormDialog
        open={isAddMeetingDialogOpen}
        onOpenChange={setIsAddMeetingDialogOpen}
        onSave={handleAddMeeting}
        availablePeople={mockPeople}
        availableTeams={mockTeamsForMeetings}
      />
    </div>
  )
}
