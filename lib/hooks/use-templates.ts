"use client"

import { useState, useEffect } from "react"

export interface MeetingTemplate {
  id: string
  name: string
  notes: string
}

const DEFAULT_TEMPLATES: MeetingTemplate[] = [
  {
    id: "1on1",
    name: "1:1",
    notes: "## 1:1\n\n### 1. Check-in\n*How they're feeling — emotional temperature + trust.*\n\n- How are you feeling this week?\n- How has work felt since our last 1:1?\n- Anything affecting your focus or energy lately?\n\n\n### 2. Work & priorities\n*Clarity and alignment.*\n\n- What are you currently focused on?\n- Do your priorities feel clear?\n- Is there anything you're unsure about or that keeps changing?\n\n\n### 3. Blockers & friction\n*Remove drag before it becomes risk.*\n\n- Is anything slowing you down?\n- Are you blocked on anyone or anything?\n- Any process, tooling, or communication issues?\n\n\n### 4. Feedback & reflection\n*Learning loop — not a performance review.*\n\n- What's been going well lately?\n- Anything you're finding frustrating?\n- Is there anything you'd like feedback on from me?\n\n\n### 5. Support & growth\n*Show investment without making it heavy.*\n\n- Is there anything you'd like more support on?\n- Are you getting enough challenge right now?\n- Anything you want more or less of in your work?\n\n",
  },
  {
    id: "performance-review",
    name: "Performance Review",
    notes: "## Performance Review\n\n**Achievements since last review**\n\n\n**Areas for improvement**\n\n\n**Feedback on collaboration and impact**\n\n\n**Goals for next period**\n\n\n**Development opportunities**\n\n",
  },
  {
    id: "low-performer-1on1",
    name: "Low Performer 1:1",
    notes: "## Low Performer 1:1\n\n**Performance concerns to address**\n\n\n**Specific examples and impact**\n\n\n**Root causes / contributing factors**\n\n\n**Support and resources available**\n\n\n**Agreed improvement actions and timeline**\n\n\n**Next check-in date**\n\n",
  },
  {
    id: "30-day-checkin",
    name: "30 day check-in",
    notes: "## 30 Day Check-in\n\n**How are you settling in so far?**\n\n\n**What's gone well in the first 30 days?**\n\n\n**What's been challenging or unclear?**\n\n\n**Do you have everything you need to do your job?**\n\n\n**Questions or concerns?**\n\n\n**Focus for the next 30 days**\n\n",
  },
  {
    id: "60-day-checkin",
    name: "60 day check-in",
    notes: "## 60 Day Check-in\n\n**Progress since the 30 day check-in**\n\n\n**Are you building the relationships you need?**\n\n\n**Confidence in role and responsibilities?**\n\n\n**Any blockers or gaps in support?**\n\n\n**Updated goals and focus areas**\n\n\n**Feedback for me as your manager**\n\n",
  },
  {
    id: "90-day-checkin",
    name: "90 day check-in",
    notes: "## 90 Day Check-in\n\n**Overall reflections on the first 90 days**\n\n\n**Key accomplishments**\n\n\n**What has surprised you (positively or negatively)?**\n\n\n**How do you feel about your impact so far?**\n\n\n**Goals and priorities going forward**\n\n\n**What can I do to better support you?**\n\n",
  },
]

const STORAGE_KEY = "cadence:meeting-templates"

export function useTemplates() {
  const [templates, setTemplates] = useState<MeetingTemplate[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setTemplates(JSON.parse(stored))
      } catch {
        setTemplates(DEFAULT_TEMPLATES)
      }
    } else {
      setTemplates(DEFAULT_TEMPLATES)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES))
    }
  }, [])

  const save = (updated: MeetingTemplate[]) => {
    setTemplates(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const addTemplate = (template: Omit<MeetingTemplate, "id">) => {
    const newTemplate: MeetingTemplate = {
      ...template,
      id: `template-${Date.now()}`,
    }
    save([...templates, newTemplate])
  }

  const updateTemplate = (id: string, updates: Partial<Omit<MeetingTemplate, "id">>) => {
    save(templates.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const deleteTemplate = (id: string) => {
    save(templates.filter(t => t.id !== id))
  }

  return { templates, addTemplate, updateTemplate, deleteTemplate }
}
