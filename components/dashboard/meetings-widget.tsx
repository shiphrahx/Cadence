"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { MeetingsBarChart, MeetingsWeekData } from "./meetings-bar-chart"

const MEETING_COLORS: Record<string, string> = {
  "1:1": "#84ffc4",
  "Team Sync": "#60a5fa",
  "Retro": "#34d399",
  "Planning": "#fbbf24",
  "Review": "#f87171",
  "Standup": "#c084fc",
  "Other": "#94a3b8",
}

const MEETING_TYPES = ["1:1", "Team Sync", "Retro", "Planning", "Review", "Standup", "Other"] as const

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
  // 8 weeks ending at the anchor week
  return Array.from({ length: 8 }, (_, i) => {
    const monday = addDays(anchorMonday, -(7 - i) * 7)
    return { monday, label: weekLabel(monday) }
  })
}

async function fetchMeetingsData(anchorMonday: Date): Promise<MeetingsWeekData[]> {
  const supabase = createClient()
  const start = addDays(anchorMonday, -7 * 7)
  const end = addDays(anchorMonday, 6) // Sunday of anchor week

  const { data: meetings } = await supabase
    .from("meetings")
    .select("id, meeting_type, meeting_date")
    .gte("meeting_date", toISO(start))
    .lte("meeting_date", toISO(end))
    .order("meeting_date", { ascending: true })

  const rows: any[] = meetings ?? []
  const buckets = buildWeekBuckets(anchorMonday)

  return buckets.map(({ monday, label }) => {
    const sunday = addDays(monday, 6)
    const mondayStr = toISO(monday)
    const sundayStr = toISO(sunday)

    const bucket = rows.filter((m) => m.meeting_date >= mondayStr && m.meeting_date <= sundayStr)

    const row: MeetingsWeekData = {
      week: label,
      "1:1": 0, "Team Sync": 0, "Retro": 0,
      "Planning": 0, "Review": 0, "Standup": 0, "Other": 0,
      total: bucket.length,
    }

    for (const m of bucket) {
      const t = m.meeting_type as string
      if (t in row) (row as any)[t]++
      else row["Other"]++
    }

    return row
  })
}

export function MeetingsWidget() {
  const today = new Date()
  const [anchorMonday, setAnchorMonday] = useState(() => getMondayOfWeek(today))
  const [data, setData] = useState<MeetingsWeekData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchMeetingsData(anchorMonday).then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [anchorMonday])

  const currentMonday = getMondayOfWeek(today)
  const isAtOrPastCurrentWindow = toISO(anchorMonday) >= toISO(currentMonday)

  const rangeLabel = (() => {
    const start = addDays(anchorMonday, -7 * 7)
    const end = addDays(anchorMonday, 6)
    return `${weekLabel(start)} – ${weekLabel(end)}`
  })()

  return (
    <div className="bg-[#1c1c1c] border border-[#383838] rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-gray-100 font-semibold text-sm">Meetings</h2>
          <p className="text-gray-500 text-xs mt-0.5">{rangeLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAnchorMonday((d) => addDays(d, -56))}
            className="p-1 rounded hover:bg-[#2a2a2a] text-gray-500 hover:text-gray-200 transition-colors"
            aria-label="Previous 8 weeks"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setAnchorMonday((d) => addDays(d, 56))}
            disabled={isAtOrPastCurrentWindow}
            className="p-1 rounded hover:bg-[#2a2a2a] text-gray-500 hover:text-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next week"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-[220px] flex items-center justify-center">
          <span className="text-gray-600 text-xs">Loading...</span>
        </div>
      ) : (
        <MeetingsBarChart data={data} />
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
        {MEETING_TYPES.map((t) => (
          <div key={t} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: MEETING_COLORS[t] }} />
            <span className="text-[10px] text-gray-500">{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
