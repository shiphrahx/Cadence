"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Plus, ChevronRight, ChevronDown } from "lucide-react"
import { MeetingFormDialog } from "@/components/meeting-form-dialog"

interface Meeting {
  id: number
  title: string
  type: string
  date: string
  attendees: string[]
  actionItems?: string
  notes?: string
  personName?: string // For 1:1 meetings
  recurrence?: string
  nextMeetingDate?: string
}

// Mock data
const initialMeetings: Meeting[] = [
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
    notes: "Discussed career progression and upcoming projects. Sarah is interested in taking on more leadership responsibilities.",
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
    actionItems: "- Deploy new infrastructure\n- Update documentation",
    notes: "Discussed Q1 roadmap and priorities. Team is on track for the release.",
  },
  {
    id: 4,
    title: "Sprint Retrospective",
    type: "Retro",
    date: "2024-12-15",
    attendees: ["Product Development"],
    notes: "Reviewed sprint performance. Identified areas for improvement.",
  },
]

// Mock people for autocomplete
const mockPeople = [
  "Sarah Miller",
  "John Doe",
  "Jane Smith",
  "Mike Johnson",
  "Emily Chen"
]

// Mock teams for autocomplete
const mockTeams = [
  "Platform Engineering",
  "Product Development",
  "Design Team",
  "Data Science",
  "Mobile Team"
]

interface TreeNode {
  type: string
  people?: {
    [personName: string]: Meeting[]
  }
  meetings?: Meeting[]
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(initialMeetings[0])
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(["1:1"]))
  const [expandedPeople, setExpandedPeople] = useState<Set<string>>(new Set(["Sarah Miller"]))
  const [leftPanelWidth, setLeftPanelWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)

  // Organize meetings into tree structure
  const organizeTree = (): { [type: string]: TreeNode } => {
    const tree: { [type: string]: TreeNode } = {}

    meetings.forEach((meeting) => {
      if (!tree[meeting.type]) {
        tree[meeting.type] = {
          type: meeting.type,
          people: meeting.type === "1:1" ? {} : undefined,
          meetings: meeting.type !== "1:1" ? [] : undefined,
        }
      }

      if (meeting.type === "1:1" && meeting.personName) {
        if (!tree[meeting.type].people![meeting.personName]) {
          tree[meeting.type].people![meeting.personName] = []
        }
        tree[meeting.type].people![meeting.personName].push(meeting)
      } else {
        tree[meeting.type].meetings!.push(meeting)
      }
    })

    // Sort meetings by date (most recent first)
    Object.values(tree).forEach((node) => {
      if (node.people) {
        Object.values(node.people).forEach((personMeetings) => {
          personMeetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        })
      }
      if (node.meetings) {
        node.meetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }
    })

    return tree
  }

  const tree = organizeTree()

  const toggleType = (type: string) => {
    const newExpanded = new Set(expandedTypes)
    if (newExpanded.has(type)) {
      newExpanded.delete(type)
    } else {
      newExpanded.add(type)
    }
    setExpandedTypes(newExpanded)
  }

  const togglePerson = (personName: string) => {
    const newExpanded = new Set(expandedPeople)
    if (newExpanded.has(personName)) {
      newExpanded.delete(personName)
    } else {
      newExpanded.add(personName)
    }
    setExpandedPeople(newExpanded)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleAddMeeting = (newMeeting: Omit<Meeting, "id">) => {
    const meeting: Meeting = {
      ...newMeeting,
      id: Math.max(...meetings.map(m => m.id), 0) + 1,
      personName: newMeeting.type === "1:1" ? newMeeting.attendees[0] : undefined,
    }
    setMeetings([...meetings, meeting])
    setSelectedMeeting(meeting)
  }

  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
    // Validate next meeting date is after meeting date
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

  // Add mouse event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      // Get the main container element (the meetings page container)
      const mainContainer = document.querySelector('main')
      if (!mainContainer) return

      const containerRect = mainContainer.getBoundingClientRect()
      const newWidth = e.clientX - containerRect.left

      if (newWidth >= 240 && newWidth <= 600) {
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

  return (
    <div className="flex h-full">
      {/* Left Panel - Tree View */}
      <div
        className="border-r bg-white overflow-y-auto flex-shrink-0"
        style={{ width: `${leftPanelWidth}px` }}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Meetings</h2>
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Log
            </Button>
          </div>
          <p className="text-xs text-gray-600">
            Select a meeting to view details
          </p>
        </div>

        <div className="p-2">
          {Object.entries(tree).map(([type, node]) => (
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
                {type}
              </button>

              {/* Expanded content */}
              {expandedTypes.has(type) && (
                <div className="ml-4">
                  {/* For 1:1 meetings, group by person */}
                  {node.people && Object.entries(node.people).map(([personName, personMeetings]) => (
                    <div key={personName} className="mb-1">
                      <button
                        onClick={() => togglePerson(personName)}
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        {expandedPeople.has(personName) ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                        {personName}
                      </button>

                      {/* Person's meetings */}
                      {expandedPeople.has(personName) && (
                        <div className="ml-4">
                          {personMeetings.map((meeting) => (
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
                  ))}

                  {/* For other meetings, just list them */}
                  {node.meetings && node.meetings.map((meeting) => (
                    <button
                      key={meeting.id}
                      onClick={() => setSelectedMeeting(meeting)}
                      className={`block w-full text-left px-2 py-1.5 text-xs rounded ml-4 ${
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
          ))}
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
          <div className="p-8">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
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

                  {/* Attendees */}
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

                  {/* Action Items */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Action Items</Label>
                    <Textarea
                      value={selectedMeeting.actionItems || ""}
                      onChange={(e) => handleUpdateMeeting({ ...selectedMeeting, actionItems: e.target.value })}
                      placeholder="- Action item 1&#10;- Action item 2"
                      rows={4}
                      className="mt-1 font-mono text-sm"
                    />
                  </div>

                  {/* Meeting Notes */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Meeting Notes</Label>
                    <Textarea
                      value={selectedMeeting.notes || ""}
                      onChange={(e) => handleUpdateMeeting({ ...selectedMeeting, notes: e.target.value })}
                      placeholder="Meeting notes, discussion points, decisions..."
                      rows={12}
                      className="mt-1 font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Markdown formatting is supported
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500">Select a meeting to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Meeting Dialog */}
      <MeetingFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddMeeting}
        availablePeople={mockPeople}
      />
    </div>
  )
}
