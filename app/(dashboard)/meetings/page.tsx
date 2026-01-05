"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownTextarea } from "@/components/ui/markdown-textarea"
import { Input } from "@/components/ui/input"
import { Plus, ChevronRight, ChevronDown, ChevronsRight, ChevronsDown } from "lucide-react"
import { MeetingFormDialog } from "@/components/meeting-form-dialog"
import {
  getMeetings,
  createMeeting,
  updateMeeting,
  type Meeting as BackendMeeting,
  type MeetingType,
  type RecurrenceType,
} from "@/lib/services/meetings"
import { getPeople } from "@/lib/services/people"
import { getTeams } from "@/lib/services/teams"

interface Meeting {
  id: string
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
  personId?: string
  teamId?: string
}

interface TreeNode {
  type: string
  people?: {
    [personName: string]: Meeting[]
  }
  teams?: {
    [teamName: string]: Meeting[]
  }
  meetings?: Meeting[]
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [people, setPeople] = useState<string[]>([])
  const [teams, setTeams] = useState<string[]>([])
  const [peopleWithIds, setPeopleWithIds] = useState<Array<{ id: string; name: string }>>([])
  const [teamsWithIds, setTeamsWithIds] = useState<Array<{ id: string; name: string }>>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(["1:1"]))
  const [expandedPeople, setExpandedPeople] = useState<Set<string>>(new Set())
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
  const [leftPanelWidth, setLeftPanelWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)

  // Load meetings, people, and teams from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const [meetingsData, peopleData, teamsData] = await Promise.all([
          getMeetings(),
          getPeople(),
          getTeams(),
        ])

        // Map backend meetings to UI format
        const uiMeetings: Meeting[] = meetingsData.map((m) => ({
          id: m.id,
          title: m.title,
          type: m.meetingType,
          date: m.meetingDate,
          attendees: m.attendees,
          actionItems: m.actionItems || undefined,
          notes: m.notes || undefined,
          personName: m.personName || undefined,
          teamName: m.teamName || undefined,
          recurrence: m.recurrence || undefined,
          nextMeetingDate: m.nextMeetingDate || undefined,
          personId: m.personId || undefined,
          teamId: m.teamId || undefined,
        }))

        setMeetings(uiMeetings)

        const activePeople = peopleData.filter(p => p.status === 'active')
        const activeTeams = teamsData.filter(t => t.status === 'active')

        setPeople(activePeople.map(p => p.name))
        setTeams(activeTeams.map(t => t.name))
        setPeopleWithIds(activePeople.map(p => ({ id: p.id, name: p.name })))
        setTeamsWithIds(activeTeams.map(t => ({ id: t.id, name: t.name })))

        // Auto-select first meeting if available
        if (uiMeetings.length > 0) {
          setSelectedMeeting(uiMeetings[0])
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }

    loadData()
  }, [])

  // Organize meetings into tree structure
  const organizeTree = (): { [type: string]: TreeNode } => {
    const tree: { [type: string]: TreeNode } = {}
    const teamBasedTypes = ["Team Sync", "Retro", "Planning", "Review", "Standup"]

    meetings.forEach((meeting) => {
      const isTeamBased = teamBasedTypes.includes(meeting.type)

      if (!tree[meeting.type]) {
        tree[meeting.type] = {
          type: meeting.type,
          people: meeting.type === "1:1" ? {} : undefined,
          teams: isTeamBased ? {} : undefined,
          meetings: !meeting.type.includes("1:1") && !isTeamBased ? [] : undefined,
        }
      }

      if (meeting.type === "1:1" && meeting.personName) {
        if (!tree[meeting.type].people![meeting.personName]) {
          tree[meeting.type].people![meeting.personName] = []
        }
        tree[meeting.type].people![meeting.personName].push(meeting)
      } else if (isTeamBased && meeting.teamName) {
        if (!tree[meeting.type].teams![meeting.teamName]) {
          tree[meeting.type].teams![meeting.teamName] = []
        }
        tree[meeting.type].teams![meeting.teamName].push(meeting)
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
      if (node.teams) {
        Object.values(node.teams).forEach((teamMeetings) => {
          teamMeetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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

  const toggleTeam = (teamName: string) => {
    const newExpanded = new Set(expandedTeams)
    if (newExpanded.has(teamName)) {
      newExpanded.delete(teamName)
    } else {
      newExpanded.add(teamName)
    }
    setExpandedTeams(newExpanded)
  }

  const expandAll = () => {
    const allTypes = Object.keys(tree)
    const allPeople: string[] = []
    const allTeams: string[] = []

    Object.values(tree).forEach(node => {
      if (node.people) {
        allPeople.push(...Object.keys(node.people))
      }
      if (node.teams) {
        allTeams.push(...Object.keys(node.teams))
      }
    })

    setExpandedTypes(new Set(allTypes))
    setExpandedPeople(new Set(allPeople))
    setExpandedTeams(new Set(allTeams))
  }

  const collapseAll = () => {
    setExpandedTypes(new Set())
    setExpandedPeople(new Set())
    setExpandedTeams(new Set())
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleAddMeeting = async (newMeeting: Omit<Meeting, "id">) => {
    try {
      // Map UI format to backend format
      const backendMeeting = await createMeeting({
        title: newMeeting.title,
        meetingType: newMeeting.type as MeetingType,
        meetingDate: newMeeting.date,
        nextMeetingDate: newMeeting.nextMeetingDate || null,
        recurrence: (newMeeting.recurrence as RecurrenceType) || null,
        actionItems: newMeeting.actionItems || null,
        notes: newMeeting.notes || null,
        personId: newMeeting.personId || null,
        teamId: newMeeting.teamId || null,
      })

      // Map backend format back to UI format
      const uiMeeting: Meeting = {
        id: backendMeeting.id,
        title: backendMeeting.title,
        type: backendMeeting.meetingType,
        date: backendMeeting.meetingDate,
        attendees: backendMeeting.attendees,
        actionItems: backendMeeting.actionItems || undefined,
        notes: backendMeeting.notes || undefined,
        personName: backendMeeting.personName || undefined,
        teamName: backendMeeting.teamName || undefined,
        recurrence: backendMeeting.recurrence || undefined,
        nextMeetingDate: backendMeeting.nextMeetingDate || undefined,
        personId: backendMeeting.personId || undefined,
        teamId: backendMeeting.teamId || undefined,
      }

      setMeetings([uiMeeting, ...meetings])
      setSelectedMeeting(uiMeeting)
    } catch (error) {
      console.error('Failed to create meeting:', error)
      alert('Failed to create meeting. Please try again.')
    }
  }

  const handleUpdateMeeting = async (updatedMeeting: Meeting) => {
    // Validate next meeting date is after meeting date
    if (updatedMeeting.nextMeetingDate && updatedMeeting.date) {
      const meetingDate = new Date(updatedMeeting.date)
      const nextMeetingDate = new Date(updatedMeeting.nextMeetingDate)
      if (nextMeetingDate <= meetingDate) {
        alert("Next meeting date must be after the meeting date")
        return
      }
    }

    try {
      // Map UI format to backend format
      const backendMeeting = await updateMeeting(updatedMeeting.id, {
        title: updatedMeeting.title,
        meetingType: updatedMeeting.type as MeetingType,
        meetingDate: updatedMeeting.date,
        nextMeetingDate: updatedMeeting.nextMeetingDate || null,
        recurrence: (updatedMeeting.recurrence as RecurrenceType) || null,
        actionItems: updatedMeeting.actionItems || null,
        notes: updatedMeeting.notes || null,
        personId: updatedMeeting.personId || null,
        teamId: updatedMeeting.teamId || null,
      })

      // Map backend format back to UI format
      const uiMeeting: Meeting = {
        id: backendMeeting.id,
        title: backendMeeting.title,
        type: backendMeeting.meetingType,
        date: backendMeeting.meetingDate,
        attendees: backendMeeting.attendees,
        actionItems: backendMeeting.actionItems || undefined,
        notes: backendMeeting.notes || undefined,
        personName: backendMeeting.personName || undefined,
        teamName: backendMeeting.teamName || undefined,
        recurrence: backendMeeting.recurrence || undefined,
        nextMeetingDate: backendMeeting.nextMeetingDate || undefined,
        personId: backendMeeting.personId || undefined,
        teamId: backendMeeting.teamId || undefined,
      }

      setMeetings(meetings.map(m => m.id === uiMeeting.id ? uiMeeting : m))
      setSelectedMeeting(uiMeeting)
    } catch (error) {
      console.error('Failed to update meeting:', error)
      alert('Failed to update meeting. Please try again.')
    }
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
        className="border-r dark:border-[#383838] bg-white dark:bg-[#262626] overflow-y-auto flex-shrink-0"
        style={{ width: `${leftPanelWidth}px` }}
      >
        <div className="p-4 border-b dark:border-[#383838]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold dark:text-gray-100">Meetings</h2>
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Log
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Select a meeting to view details
            </p>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={expandAll}
                className="h-6 px-2 text-xs"
                title="Expand all"
              >
                <ChevronsDown className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={collapseAll}
                className="h-6 px-2 text-xs"
                title="Collapse all"
              >
                <ChevronsRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-2">
          {Object.entries(tree).map(([type, node]) => (
            <div key={type} className="mb-1">
              {/* Meeting Type */}
              <button
                onClick={() => toggleType(type)}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#292929] rounded"
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
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#292929] rounded"
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
                                  ? "bg-primary-50 dark:bg-primary-dark-900/30 dark:bg-primary-dark-900/30 text-primary-700 dark:text-primary-dark-400 dark:text-primary-dark-400 font-medium"
                                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#292929]"
                              }`}
                            >
                              {formatDate(meeting.date)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* For team-based meetings, group by team */}
                  {node.teams && Object.entries(node.teams).map(([teamName, teamMeetings]) => (
                    <div key={teamName} className="mb-1">
                      <button
                        onClick={() => toggleTeam(teamName)}
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#292929] rounded"
                      >
                        {expandedTeams.has(teamName) ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                        {teamName}
                      </button>

                      {/* Team's meetings */}
                      {expandedTeams.has(teamName) && (
                        <div className="ml-4">
                          {teamMeetings.map((meeting) => (
                            <button
                              key={meeting.id}
                              onClick={() => setSelectedMeeting(meeting)}
                              className={`block w-full text-left px-2 py-1.5 text-xs rounded ${
                                selectedMeeting?.id === meeting.id
                                  ? "bg-primary-50 dark:bg-primary-dark-900/30 dark:bg-primary-dark-900/30 text-primary-700 dark:text-primary-dark-400 dark:text-primary-dark-400 font-medium"
                                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#292929]"
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
                          ? "bg-primary-50 dark:bg-primary-dark-900/30 dark:bg-primary-dark-900/30 text-primary-700 dark:text-primary-dark-400 dark:text-primary-dark-400 font-medium"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#292929]"
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
        className={`w-1 bg-gray-200 hover:bg-primary-400 dark:hover:bg-primary-dark-400 cursor-col-resize flex-shrink-0 ${
          isResizing ? 'bg-primary-500' : ''
        }`}
        onMouseDown={handleMouseDown}
      />

      {/* Right Panel - Meeting Details */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#1c1c1c]">
        {selectedMeeting ? (
          <div className="p-8">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Date and Next Meeting Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</Label>
                      <Input
                        type="date"
                        value={selectedMeeting.date}
                        onChange={(e) => handleUpdateMeeting({ ...selectedMeeting, date: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    {selectedMeeting.type === "1:1" && selectedMeeting.recurrence && selectedMeeting.recurrence !== "none" && selectedMeeting.nextMeetingDate && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Next Meeting</Label>
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
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</Label>
                      <Input
                        value={selectedMeeting.title}
                        onChange={(e) => handleUpdateMeeting({ ...selectedMeeting, title: e.target.value })}
                        placeholder="Meeting title"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Attendees</Label>
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
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Action Items</Label>
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
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meeting Notes</Label>
                    <MarkdownTextarea
                      value={selectedMeeting.notes || ""}
                      onValueChange={(value) => handleUpdateMeeting({ ...selectedMeeting, notes: value })}
                      placeholder="Meeting notes, discussion points, decisions..."
                      rows={12}
                      className="mt-1 text-sm"
                    />
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
        availablePeople={people}
        availableTeams={teams}
        peopleWithIds={peopleWithIds}
        teamsWithIds={teamsWithIds}
      />
    </div>
  )
}
