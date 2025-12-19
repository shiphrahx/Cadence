"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Calendar as CalendarIcon, MoreHorizontal, Pencil, Trash2, Users, User } from "lucide-react"
import { MeetingFormDialog } from "@/components/meeting-form-dialog"

interface Meeting {
  id: number
  title: string
  type: string
  date: string
  attendees: string[]
  status: "upcoming" | "completed" | "cancelled"
  notes?: string
}

// Mock data
const initialMeetings: Meeting[] = [
  {
    id: 1,
    title: "1:1 with Sarah Miller",
    type: "1:1",
    date: "2024-12-20",
    attendees: ["Sarah Miller"],
    status: "upcoming",
  },
  {
    id: 2,
    title: "Team Sync - Platform Engineering",
    type: "Team Sync",
    date: "2024-12-18",
    attendees: ["Platform Engineering"],
    status: "completed",
    notes: "Discussed Q1 roadmap and priorities",
  },
  {
    id: 3,
    title: "Sprint Retrospective",
    type: "Retro",
    date: "2024-12-15",
    attendees: ["Product Development"],
    status: "completed",
  },
]

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings)
  const [showCompleted, setShowCompleted] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [deletingMeeting, setDeletingMeeting] = useState<Meeting | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [selectedMeetingMenu, setSelectedMeetingMenu] = useState<number | null>(null)

  const filteredMeetings = showCompleted
    ? meetings
    : meetings.filter(meeting => meeting.status !== "completed")

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedMeetingMenu !== null) {
        setSelectedMeetingMenu(null)
      }
    }

    if (selectedMeetingMenu !== null) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [selectedMeetingMenu])

  const handleAddMeeting = (newMeeting: Omit<Meeting, "id">) => {
    const meeting: Meeting = {
      ...newMeeting,
      id: Math.max(...meetings.map(m => m.id), 0) + 1,
    }
    setMeetings([...meetings, meeting])
  }

  const handleEditMeeting = (updatedMeeting: Meeting) => {
    setMeetings(meetings.map(m => m.id === updatedMeeting.id ? updatedMeeting : m))
    setEditingMeeting(null)
  }

  const handleDeleteMeeting = () => {
    if (deletingMeeting && deleteConfirmation === deletingMeeting.title) {
      setMeetings(meetings.filter(m => m.id !== deletingMeeting.id))
      setDeletingMeeting(null)
      setDeleteConfirmation("")
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "completed":
        return "bg-green-100 text-green-700 border-green-300"
      case "cancelled":
        return "bg-gray-100 text-gray-700 border-gray-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your meetings
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetings.filter(m => m.status === "upcoming").length}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled meetings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {meetings.filter(m => {
                const meetingDate = new Date(m.date)
                const today = new Date()
                const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                return meetingDate >= today && meetingDate <= weekFromNow
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              In the next 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetings.filter(m => m.status === "completed").length}</div>
            <p className="text-xs text-muted-foreground">
              Total completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Meetings List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Meetings</CardTitle>
              <CardDescription>
                {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? "Hide" : "Show"} Completed
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Attendees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeetings.map((meeting) => (
                <TableRow
                  key={meeting.id}
                  onClick={() => setEditingMeeting(meeting)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">{meeting.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{meeting.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(meeting.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {meeting.attendees.length === 1 && !meeting.attendees[0].includes('Engineering') && !meeting.attendees[0].includes('Development') ? (
                        <User className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Users className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">{meeting.attendees.join(", ")}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(meeting.status)}>
                      {meeting.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="relative inline-block">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedMeetingMenu(selectedMeetingMenu === meeting.id ? null : meeting.id)
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {selectedMeetingMenu === meeting.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingMeeting(meeting)
                                setSelectedMeetingMenu(null)
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeletingMeeting(meeting)
                                setSelectedMeetingMenu(null)
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredMeetings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No meetings found</h3>
              <p className="text-sm text-gray-600 mb-4">
                {showCompleted
                  ? "You don't have any meetings yet."
                  : "No upcoming meetings. Try showing completed meetings."}
              </p>
              {!showCompleted && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Your First Meeting
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Meeting Dialog */}
      <MeetingFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddMeeting}
      />

      {/* Edit Meeting Dialog */}
      <MeetingFormDialog
        open={!!editingMeeting}
        onOpenChange={(open) => !open && setEditingMeeting(null)}
        meeting={editingMeeting}
        onSave={handleEditMeeting}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingMeeting} onOpenChange={(open) => !open && setDeletingMeeting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Meeting</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this meeting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="confirmDelete">
                Type <strong>{deletingMeeting?.title}</strong> to confirm
              </Label>
              <Input
                id="confirmDelete"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type meeting title to confirm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeletingMeeting(null)
              setDeleteConfirmation("")
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMeeting}
              disabled={deleteConfirmation !== deletingMeeting?.title}
            >
              Delete Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
