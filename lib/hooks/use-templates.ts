"use client"

import { useState, useEffect } from "react"

export interface MeetingTemplate {
  id: string
  name: string
  notes: string
}

const DEFAULT_TEMPLATES: MeetingTemplate[] = [
  {
    id: "career-growth",
    name: "Career Growth Check-in",
    notes: "## Career Growth Check-in\n\n**What's going well?**\n\n\n**What are the current challenges?**\n\n\n**Progress on goals since last meeting**\n\n\n**Short-term focus for next period**\n\n\n**Any support needed from me?**\n\n",
  },
  {
    id: "regular-checkin",
    name: "Regular Check-in",
    notes: "## Regular Check-in\n\n**How are things going overall?**\n\n\n**Current priorities and blockers**\n\n\n**Team / project updates**\n\n\n**Action items from last time**\n\n\n**Anything else on your mind?**\n\n",
  },
  {
    id: "performance-review",
    name: "Performance Review",
    notes: "## Performance Review\n\n**Achievements since last review**\n\n\n**Areas for improvement**\n\n\n**Feedback on collaboration and impact**\n\n\n**Goals for next period**\n\n\n**Development opportunities**\n\n",
  },
  {
    id: "peer-1on1",
    name: "Peer 1:1",
    notes: "## Peer 1:1\n\n**What are you working on?**\n\n\n**Any cross-team dependencies or blockers?**\n\n\n**Collaboration opportunities**\n\n\n**Feedback exchange**\n\n",
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
