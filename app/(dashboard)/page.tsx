import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, Calendar, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

async function getDashboardData() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + 1) // Monday
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6) // Sunday
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  const [tasksRes, meetingsRes, teamsRes] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, due_date, status, priority')
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true }),
    supabase
      .from('meetings')
      .select('id, title, meeting_type, meeting_date, next_meeting_date, people(full_name)')
      .order('next_meeting_date', { ascending: true }),
    supabase
      .from('teams')
      .select('id, status, team_memberships(count)')
      .eq('status', 'active'),
  ])

  const tasks = tasksRes.data ?? []
  const meetings = meetingsRes.data ?? []
  const teams = teamsRes.data ?? []

  // Tasks this week (due within the current week)
  const tasksThisWeek = tasks.filter((t: any) => t.due_date >= weekStartStr && t.due_date <= weekEndStr)
  const overdueCount = tasks.filter((t: any) => t.due_date < todayStr && t.status !== 'completed').length

  // Active teams + total member count
  const activeTeamCount = teams.length
  const totalMembers = teams.reduce((sum: number, t: any) => sum + (t.team_memberships[0]?.count ?? 0), 0)

  // Meetings this week
  const meetingsThisWeek = meetings.filter((m: any) => {
    const date = m.next_meeting_date || m.meeting_date
    return date >= weekStartStr && date <= weekEndStr
  })
  const oneOnOnesThisWeek = meetingsThisWeek.filter((m: any) => m.meeting_type === '1:1').length
  const otherMeetingsThisWeek = meetingsThisWeek.length - oneOnOnesThisWeek

  // Upcoming 1:1s — next_meeting_date >= today, sorted ascending, limit 5
  const upcoming1on1s = meetings
    .filter((m: any) => m.meeting_type === '1:1')
    .map((m: any) => ({ ...m, sortDate: m.next_meeting_date || m.meeting_date }))
    .filter((m: any) => m.sortDate >= todayStr)
    .sort((a: any, b: any) => a.sortDate.localeCompare(b.sortDate))
    .slice(0, 5)

  // Tasks this week sorted by due date, limit 5
  const weekTasksDisplay = tasksThisWeek.slice(0, 5)

  return {
    weekStart,
    weekEnd,
    tasksThisWeekCount: tasksThisWeek.length,
    overdueCount,
    meetingsThisWeekCount: meetingsThisWeek.length,
    oneOnOnesThisWeek,
    otherMeetingsThisWeek,
    activeTeamCount,
    totalMembers,
    upcoming1on1s,
    weekTasksDisplay,
    todayStr,
  }
}

function formatDisplayDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function priorityLabel(priority: string) {
  const map: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    very_high: 'Very High',
  }
  return map[priority] ?? priority
}

function priorityColor(priority: string) {
  const map: Record<string, string> = {
    low: 'text-gray-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    very_high: 'text-red-400',
  }
  return map[priority] ?? 'text-gray-400'
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  const formatWeekDate = (date: Date) =>
    date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-gray-100 font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Week of {formatWeekDate(data.weekStart)} – {formatWeekDate(data.weekEnd)}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks This Week</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.tasksThisWeekCount}</div>
            <p className="text-muted-foreground">
              {data.overdueCount > 0 ? `${data.overdueCount} overdue` : 'None overdue'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meetings This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.meetingsThisWeekCount}</div>
            <p className="text-muted-foreground">
              {data.oneOnOnesThisWeek} 1:1{data.oneOnOnesThisWeek !== 1 ? 's' : ''},{' '}
              {data.otherMeetingsThisWeek} other
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeTeamCount}</div>
            <p className="text-muted-foreground">
              {data.totalMembers} total member{data.totalMembers !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* This Week Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks This Week</CardTitle>
            <CardDescription>Due this week</CardDescription>
          </CardHeader>
          <CardContent>
            {data.weekTasksDisplay.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tasks due this week.</p>
            ) : (
              <div className="space-y-3">
                {data.weekTasksDisplay.map((task: any) => {
                  const isOverdue = task.due_date < data.todayStr && task.status !== 'completed'
                  const isDone = task.status === 'completed'
                  return (
                    <div key={task.id} className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                          isDone
                            ? 'bg-green-500'
                            : isOverdue
                            ? 'bg-red-500'
                            : 'bg-gray-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDone ? 'line-through text-muted-foreground' : 'text-gray-100'}`}>
                          {task.title}
                        </p>
                        <p className={`text-xs ${isOverdue && !isDone ? 'text-red-400' : 'text-muted-foreground'}`}>
                          {isOverdue && !isDone ? 'Overdue · ' : ''}
                          {formatDisplayDate(task.due_date)}
                          {' · '}
                          <span className={priorityColor(task.priority)}>{priorityLabel(task.priority)}</span>
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming 1:1s</CardTitle>
            <CardDescription>Next scheduled 1:1 meetings</CardDescription>
          </CardHeader>
          <CardContent>
            {data.upcoming1on1s.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming 1:1s scheduled.</p>
            ) : (
              <div className="space-y-3">
                {data.upcoming1on1s.map((meeting: any) => {
                  const personName = (meeting.people as any)?.full_name ?? meeting.title
                  const initials = getInitials(personName)
                  const isToday = meeting.sortDate === data.todayStr
                  return (
                    <div key={meeting.id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-900/40 text-purple-300 flex-shrink-0">
                        <span className="text-xs font-semibold">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-100 truncate">{personName}</p>
                        <p className="text-xs text-muted-foreground">
                          {isToday ? 'Today' : formatDisplayDate(meeting.sortDate)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
