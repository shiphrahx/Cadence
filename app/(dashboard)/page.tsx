import { createClient } from "@/lib/supabase/server"
import { MeetingsBarChart, MeetingsWeekData } from "@/components/dashboard/meetings-bar-chart"
import { TasksBarChart, TasksWeekData } from "@/components/dashboard/tasks-bar-chart"
import { TaskPriorityChart } from "@/components/dashboard/task-priority-chart"
import { DashboardCalendar, CalendarTask } from "@/components/dashboard/dashboard-calendar"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toISO(d: Date): string {
  return d.toISOString().split("T")[0]
}

function weekLabel(monday: Date): string {
  return monday.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

// Build 8 weeks of data for charts — current week + 7 previous weeks
function buildWeekBuckets(anchorMonday: Date): { monday: Date; label: string }[] {
  return Array.from({ length: 8 }, (_, i) => {
    const monday = addDays(anchorMonday, -(7 - i) * 7)
    return { monday, label: weekLabel(monday) }
  })
}

// ─── Data Fetching ─────────────────────────────────────────────────────────────

async function getDashboardData() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentMonday = getMondayOfWeek(today)

  // Fetch 8 weeks back for chart data
  const chartStart = addDays(currentMonday, -7 * 7)
  const chartStartStr = toISO(chartStart)

  const [tasksRes, meetingsRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, due_date, status, priority")
      .not("due_date", "is", null)
      .gte("due_date", chartStartStr)
      .order("due_date", { ascending: true }),
    supabase
      .from("meetings")
      .select("id, title, meeting_type, meeting_date, next_meeting_date")
      .gte("meeting_date", chartStartStr)
      .order("meeting_date", { ascending: true }),
  ])

  const tasks: any[] = tasksRes.data ?? []
  const meetings: any[] = meetingsRes.data ?? []

  // ── Build meetings-per-week chart data ──────────────────────────────────────
  const weekBuckets = buildWeekBuckets(currentMonday)

  const meetingWeekData: MeetingsWeekData[] = weekBuckets.map(({ monday, label }) => {
    const sunday = addDays(monday, 6)
    const mondayStr = toISO(monday)
    const sundayStr = toISO(sunday)

    const bucket = meetings.filter((m: any) => {
      const d = m.meeting_date
      return d >= mondayStr && d <= sundayStr
    })

    const row: MeetingsWeekData = {
      week: label,
      "1:1": 0,
      "Team Sync": 0,
      "Retro": 0,
      "Planning": 0,
      "Review": 0,
      "Standup": 0,
      "Other": 0,
      total: bucket.length,
    }

    for (const m of bucket) {
      const t = m.meeting_type as keyof Omit<MeetingsWeekData, "week" | "total">
      if (t in row) {
        ;(row as any)[t]++
      } else {
        row["Other"]++
      }
    }

    return row
  })

  // ── Build tasks-due-per-week chart data ────────────────────────────────────
  const taskWeekData: TasksWeekData[] = weekBuckets.map(({ monday, label }) => {
    const sunday = addDays(monday, 6)
    const mondayStr = toISO(monday)
    const sundayStr = toISO(sunday)

    const bucket = tasks.filter((t: any) => {
      const d = t.due_date
      return d >= mondayStr && d <= sundayStr
    })

    const row: TasksWeekData = {
      week: label,
      "Not started": 0,
      "In progress": 0,
      "Blocked": 0,
      "Done": 0,
      total: bucket.length,
    }

    const statusMap: Record<string, keyof Omit<TasksWeekData, "week" | "total">> = {
      not_started: "Not started",
      in_progress: "In progress",
      blocked: "Blocked",
      completed: "Done",
    }

    for (const t of bucket) {
      const key = statusMap[t.status] ?? "Not started"
      row[key]++
    }

    return row
  })

  // ── Calendar tasks — all tasks with a due date ─────────────────────────────
  const priorityMap: Record<string, CalendarTask["priority"]> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    very_high: "Very High",
  }
  const statusMapUi: Record<string, CalendarTask["status"]> = {
    not_started: "Not started",
    in_progress: "In progress",
    blocked: "Blocked",
    completed: "Done",
  }

  // Fetch all tasks with due dates for the calendar (not restricted to chart window)
  const { data: allTasks } = await supabase
    .from("tasks")
    .select("id, title, due_date, status, priority")
    .not("due_date", "is", null)
    .order("due_date", { ascending: true })

  const calendarTasks: CalendarTask[] = (allTasks ?? []).map((t: any) => ({
    id: t.id,
    title: t.title,
    dueDate: t.due_date,
    priority: priorityMap[t.priority] ?? "Medium",
    status: statusMapUi[t.status] ?? "Not started",
  }))

  return {
    meetingWeekData,
    taskWeekData,
    calendarTasks,
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { meetingWeekData, taskWeekData, calendarTasks } = await getDashboardData()

  const today = new Date()
  const label = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-gray-100 font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">{label}</p>
      </div>

      {/* ── Widgets row ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Meetings per week */}
        <div className="bg-[#1c1c1c] border border-[#383838] rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-gray-100 font-semibold text-sm">Meetings</h2>
            <p className="text-gray-500 text-xs mt-0.5">Per week, last 8 weeks</p>
          </div>
          <MeetingsBarChart data={meetingWeekData} />
          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
            {(["1:1", "Team Sync", "Retro", "Planning", "Review", "Standup", "Other"] as const).map((t) => {
              const colors: Record<string, string> = {
                "1:1": "#84ffc4",
                "Team Sync": "#60a5fa",
                "Retro": "#34d399",
                "Planning": "#fbbf24",
                "Review": "#f87171",
                "Standup": "#c084fc",
                "Other": "#94a3b8",
              }
              return (
                <div key={t} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[t] }} />
                  <span className="text-[10px] text-gray-500">{t}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tasks due per week */}
        <div className="bg-[#1c1c1c] border border-[#383838] rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-gray-100 font-semibold text-sm">Tasks Due</h2>
            <p className="text-gray-500 text-xs mt-0.5">Per week, last 8 weeks</p>
          </div>
          <TasksBarChart data={taskWeekData} />
          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
            {(["Not started", "In progress", "Blocked", "Done"] as const).map((s) => {
              const colors: Record<string, string> = {
                "Not started": "#4b5563",
                "In progress": "#60a5fa",
                "Blocked": "#f87171",
                "Done": "#34d399",
              }
              return (
                <div key={s} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[s] }} />
                  <span className="text-[10px] text-gray-500">{s}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Priority breakdown placeholder */}
        <div className="bg-[#1c1c1c] border border-[#383838] rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-gray-100 font-semibold text-sm">Priority Breakdown</h2>
            <p className="text-gray-500 text-xs mt-0.5">Tasks by priority</p>
          </div>
          <TaskPriorityChart />
        </div>
      </div>

      {/* ── Calendar ── */}
      <div>
        <DashboardCalendar tasks={calendarTasks} />
      </div>
    </div>
  )
}
