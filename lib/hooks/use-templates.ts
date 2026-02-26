"use client"

import { useState } from "react"

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
    notes: "## Performance Review\n\n### 1. Set context\n*Manager-led.*\n\n\"This conversation is about reflecting on the last period, what's gone well, what hasn't, and what we do next.\"\n\n\n### 2. Period overview\n*Start with their view first.*\n\n- How do you feel the last period has gone overall?\n- What are you most proud of?\n- What felt hardest or most frustrating?\n\n\n### 3. Delivery & outcomes\n\n- What goals or expectations do you think you met?\n- Where do you think you fell short?\n- What outcomes are you happiest with?\n\n\n### 4. Strengths\n\n- \"Here are the strengths I've consistently seen…\"\n- \"These are areas where you add the most value…\"\n\n\n### 5. Areas for improvement\n\n- \"These are the areas I think need improvement…\"\n- \"Here's the impact when these don't land…\"\n\n- Does this align with your view?\n- Is anything unclear or unexpected here?\n\n\n### 6. Feedback themes\n\n- What feedback patterns have you noticed?\n- Is there feedback you disagree with or don't understand?\n- What feedback would you like to act on next?\n\n\n### 7. Growth & development\n*Tie this back to role expectations.*\n\n- Where do you want to grow next?\n- What skills or behaviours should we focus on?\n- What support would help you most?\n\n\n### 8. Looking forward\n\n- What should success look like next period?\n- What do you want to focus on changing or improving?\n- Are priorities and expectations clear?\n\n",
  },
  {
    id: "low-performer-1on1",
    name: "Low Performer 1:1",
    notes: "## Low Performer 1:1\n\n### 1. Check-in\n\n- How are you feeling about work at the moment?\n- How have the last few weeks felt for you?\n\n\n### 2. Set context\n*Manager-led.*\n\n\"I want to talk about some concerns I've noticed around your work. The goal here is to understand what's going on and how I can support you.\"\n\n\n### 3. Observations\n*Facts, not judgement. Stick to observable behaviour, avoid labels, focus on impact.*\n\n- \"Here's what I've been seeing…\"\n- \"These are specific examples where expectations weren't met…\"\n\n\n### 4. Their perspective\n\n- How does this land for you?\n- Do you see the same gaps?\n- Is there anything contributing to this that I might not be aware of?\n\n\n### 5. Expectations & clarity\n\n- What do you think is expected of you in your role right now?\n- Where do you feel expectations are unclear?\n- What would \"good\" look like from your perspective?\n\n\n### 6. Support & blockers\n\n- What's making this harder than it should be?\n- Is this a skills gap, context gap, or capacity issue?\n- What support would help you most right now?\n\n\n### 7. Short-term focus (next 2–4 weeks)\n\n- What do we want to see improve first?\n- What would success look like over the next few weeks?\n- How will we check progress?\n\n\n### 8. Actions & ownership\n\n- What actions are we agreeing on?\n- Who owns each one?\n- When will we follow up?\n\n",
  },
  {
    id: "30-day-checkin",
    name: "30 day check-in",
    notes: "## 30 Day Check-in\n\n### 1. Overall check-in\n\n- How are you feeling after your first month?\n- What's been easier than expected?\n- What's been harder than you thought?\n\n\n### 2. Onboarding & context\n*Watch for: gaps in documentation, unclear ownership, overwhelm or isolation.*\n\n- How did onboarding feel overall?\n- Is there anything you wish you had known earlier?\n- Do you feel you understand how the team works day to day?\n\n\n### 3. Role clarity & expectations\n\n- Do you feel clear on what's expected of you right now?\n- Does the role match what you expected?\n- Are your current priorities clear?\n\n\n### 4. Work & collaboration\n\n- How are you finding collaboration with the team?\n- Do you feel comfortable asking for help?\n- Anyone or anything you're unsure how to work with yet?\n\n\n### 5. Support & unblockers\n\n- Is anything slowing you down or blocking you?\n- What support would help you most right now?\n- Is there anything I can do differently to support you?\n\n\n### 6. Early feedback\n*Two-way.*\n\n- What's been going well so far?\n- Anything that's been frustrating?\n- Any early feedback for me or the team?\n\n",
  },
  {
    id: "60-day-checkin",
    name: "60 day check-in",
    notes: "## 60 Day Check-in\n\n### 1. Overall reflection\n\n- How are you feeling at the two-month mark?\n- What's changed for you since the 30-day check-in?\n- Do you feel more settled now?\n\n\n### 2. Work & impact\n\n- What work are you most proud of so far?\n- Where do you feel you're adding the most value?\n- Is there anything you expected to be doing by now but aren't?\n\n\n### 3. Ownership & autonomy\n\n- Do you feel confident owning your work?\n- Are decision-making boundaries clear?\n- Do you know when to push forward vs ask for help?\n\n\n### 4. Collaboration & team dynamics\n\n- How is collaboration with the team going?\n- Any friction or confusion in how we work together?\n- Do you feel comfortable challenging ideas?\n\n\n### 5. Feedback & expectations\n*Two-way.*\n\n- What feedback have you received so far?\n- Does it make sense and feel fair?\n- Is there any feedback you'd like from me right now?\n\n\n### 6. Support & adjustments\n\n- What's currently slowing you down?\n- What would help you be more effective?\n- Is there anything we should adjust in priorities or scope?\n\n",
  },
  {
    id: "90-day-checkin",
    name: "90 day check-in",
    notes: "## 90 Day Check-in\n\n### 1. Overall reflection\n\n- How are you feeling after your first three months?\n- Looking back, what went better than expected?\n- What's been more challenging than you thought?\n\n\n### 2. Role fit & expectations\n\n- Do you feel clear on what success looks like in your role?\n- Do you feel the role matches your strengths?\n- Is anything about the role still unclear?\n\n\n### 3. Impact & delivery\n\n- What impact do you feel you've had so far?\n- Where do you think you've contributed most?\n- Are there areas where you feel underused or overstretched?\n\n\n### 4. Ownership & decision-making\n\n- Do you feel confident owning problems end to end?\n- Are you clear on when to make decisions independently?\n- Where do you still need guidance?\n\n\n### 5. Feedback & development\n\n- What feedback have you received so far?\n- What patterns are you noticing?\n- What would you like to improve over the next few months?\n\n\n### 6. Looking forward\n\n- What do you want to focus on next?\n- Where do you want to grow in the next quarter?\n- Is there anything you're concerned about going forward?\n\n",
  },
]

export function useTemplates() {
  const [templates, setTemplates] = useState<MeetingTemplate[]>(DEFAULT_TEMPLATES)

  const addTemplate = (template: Omit<MeetingTemplate, "id">) => {
    const newTemplate: MeetingTemplate = {
      ...template,
      id: `template-${Date.now()}`,
    }
    setTemplates(prev => [...prev, newTemplate])
  }

  const updateTemplate = (id: string, updates: Partial<Omit<MeetingTemplate, "id">>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  return { templates, addTemplate, updateTemplate, deleteTemplate }
}
