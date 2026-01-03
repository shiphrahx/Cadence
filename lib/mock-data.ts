/**
 * Centralized mock data for the application
 * This file will be replaced with database queries in future phases
 */

export interface Team {
  id?: number
  name: string
  description: string
  status: "active" | "inactive"
  memberCount: number
  createdAt: string
  memberIds?: number[]
  notes?: string
  documentationUrl?: string
}

export interface Person {
  id?: number
  name: string
  role: string
  level: string
  startDate: string
  status: "active" | "inactive"
  teams: string[]
  notes?: string
}

export interface Meeting {
  id: number
  title: string
  date: string
  time: string
  attendees: string[]
  type: string
  status: string
  notes: string
}

// Teams mock data
export const mockTeams: Team[] = [
  {
    id: 1,
    name: "Platform Engineering",
    description: "Core platform development and infrastructure",
    status: "active",
    memberCount: 8,
    createdAt: "2023-01-15",
    memberIds: [1, 2],
  },
  {
    id: 2,
    name: "Product Development",
    description: "Customer-facing product features and improvements",
    status: "active",
    memberCount: 12,
    createdAt: "2023-02-01",
    memberIds: [2, 3, 4],
  },
  {
    id: 3,
    name: "Mobile Team",
    description: "iOS and Android application development",
    status: "active",
    memberCount: 6,
    createdAt: "2023-03-10",
    memberIds: [5],
  },
]

// People mock data
export const mockPeople: Person[] = [
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

// Meetings mock data
export const mockMeetings: Meeting[] = [
  {
    id: 1,
    title: "Weekly Team Sync",
    date: "2025-01-06",
    time: "10:00",
    attendees: ["Sarah Miller", "John Doe"],
    type: "recurring",
    status: "scheduled",
    notes: "",
  },
  {
    id: 2,
    title: "1:1 with Sarah",
    date: "2025-01-07",
    time: "14:00",
    attendees: ["Sarah Miller"],
    type: "one-on-one",
    status: "scheduled",
    notes: "",
  },
  {
    id: 3,
    title: "Sprint Planning",
    date: "2025-01-08",
    time: "09:00",
    attendees: ["Sarah Miller", "John Doe", "Emily Wong"],
    type: "recurring",
    status: "scheduled",
    notes: "",
  },
]
