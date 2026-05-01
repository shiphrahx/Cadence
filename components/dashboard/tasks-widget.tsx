"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { TasksBarChart, TasksWeekData } from "./tasks-bar-chart"

const STATUS_COLORS: Record<string, string> = {
  "Not started": "#4b5563",
  "In progress": "#60a5fa",
  "Blocked": "#f87171",
  "Done": "#34d399",
}

const TASK_STATUSES = ["Not started", "In progress", "Blocked", "Done"] as const

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

function buildWeekBuckets(anchorMonday: Date): { monday: Date; label: string }[] {
  // 8 weeks starting at the anchor week
  return Array.from({ length: 8 }, (_, i) => {
    const monday = addDays(anchorMonday, i * 7)
    return { monday, label: weekLabel(monday) }
  })
}

const STATUS_MAP: Record<string, keyof Omit<TasksWeekData, "week" | "total">> = {
  not_started: "Not started",
  in_progress: "In progress",
  blocked: "Blocked",
  completed: "Done",
}

async function fetchTasksData(anchorMonday: Date): Promise<TasksWeekData[]> {
  const supabase = createClient()
  const end = addDays(anchorMonday, 7 * 8 - 1) // end of the 8th week

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, due_date, status")
    .not("due_date", "is", null)
    .gte("due_date", toISO(anchorMonday))
    .lte("due_date", toISO(end))
    .order("due_date", { ascending: true })

  const rows: any[] = tasks ?? []
  const buckets = buildWeekBuckets(anchorMonday)

  return buckets.map(({ monday, label }) => {
    const sunday = addDays(monday, 6)
    const mondayStr = toISO(monday)
    const sundayStr = toISO(sunday)

    const bucket = rows.filter((t) => t.due_date >= mondayStr && t.due_date <= sundayStr)

    const row: TasksWeekData = {
      week: label,
      "Not started": 0, "In progress": 0, "Blocked": 0, "Done": 0,
      total: bucket.length,
    }

    for (const t of bucket) {
      const key = STATUS_MAP[t.status] ?? "Not started"
      row[key]++
    }

    return row
  })
}

export function TasksWidget() {
  const today = new Date()
  const [anchorMonday, setAnchorMonday] = useState(() => getMondayOfWeek(today))
  const [data, setData] = useState<TasksWeekData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchTasksData(anchorMonday).then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [anchorMonday])

  const currentMonday = getMondayOfWeek(today)
  const isAtCurrentWindow = toISO(anchorMonday) <= toISO(currentMonday)

  const rangeLabel = (() => {
    const end = addDays(anchorMonday, 7 * 8 - 1)
    return `${weekLabel(anchorMonday)} – ${weekLabel(getMondayOfWeek(end))}`
  })()

  return (
    <div style={{ background: "var(--surf)", border: "1px solid var(--border-1)", borderRadius: "12px", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <h2>Tasks Due</h2>
          <p style={{ marginTop: "2px" }}>{rangeLabel}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            onClick={() => setAnchorMonday((d) => addDays(d, -56))}
            disabled={isAtCurrentWindow}
            style={{ padding: "4px", borderRadius: "4px", background: "none", border: "none", color: "var(--text-3)", cursor: isAtCurrentWindow ? "not-allowed" : "pointer", opacity: isAtCurrentWindow ? 0.3 : 1 }}
            onMouseEnter={e => { if (!isAtCurrentWindow) { (e.currentTarget.style.background = "var(--surf-3)"); (e.currentTarget.style.color = "var(--text-1)") } }}
            onMouseLeave={e => { (e.currentTarget.style.background = "none"); (e.currentTarget.style.color = "var(--text-3)") }}
            aria-label="Previous 8 weeks"
          >
            <ChevronLeft style={{ width: "14px", height: "14px" }} />
          </button>
          <button
            onClick={() => setAnchorMonday((d) => addDays(d, 56))}
            style={{ padding: "4px", borderRadius: "4px", background: "none", border: "none", color: "var(--text-3)", cursor: "pointer" }}
            onMouseEnter={e => { (e.currentTarget.style.background = "var(--surf-3)"); (e.currentTarget.style.color = "var(--text-1)") }}
            onMouseLeave={e => { (e.currentTarget.style.background = "none"); (e.currentTarget.style.color = "var(--text-3)") }}
            aria-label="Next week"
          >
            <ChevronRight style={{ width: "14px", height: "14px" }} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--text-3)" }}>Loading...</span>
        </div>
      ) : (
        <TasksBarChart data={data} />
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: "12px" }}>
        {TASK_STATUSES.map((s) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, backgroundColor: STATUS_COLORS[s] }} />
            <span style={{ fontSize: "var(--text-caption)", color: "var(--text-3)" }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
