/**
 * Meetings Service
 * Handles all database operations for meetings
 */

import { createClient } from '@/lib/supabase/client'

export type MeetingType = '1:1' | 'Team Sync' | 'Retro' | 'Planning' | 'Review' | 'Standup' | 'Other'
export type RecurrenceType = 'none' | 'weekly' | 'fortnightly' | 'monthly' | 'custom'

export interface Meeting {
  id: string
  title: string
  meetingType: MeetingType
  meetingDate: string
  nextMeetingDate?: string | null
  recurrence?: RecurrenceType | null
  actionItems?: string | null
  notes?: string | null
  personId?: string | null
  personName?: string | null
  teamId?: string | null
  teamName?: string | null
  attendees: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Get all meetings for the current user
 */
export async function getMeetings(): Promise<Meeting[]> {
  const supabase = createClient()

  const { data: meetings, error } = await supabase
    .from('meetings')
    .select(`
      *,
      people(full_name),
      teams(name)
    `)
    .order('meeting_date', { ascending: false })

  if (error) throw error

  return meetings.map((meeting: any) => ({
    id: meeting.id,
    title: meeting.title,
    meetingType: meeting.meeting_type,
    meetingDate: meeting.meeting_date,
    nextMeetingDate: meeting.next_meeting_date,
    recurrence: meeting.recurrence,
    actionItems: meeting.action_items,
    notes: meeting.notes,
    personId: meeting.person_id,
    personName: meeting.people?.full_name || null,
    teamId: meeting.team_id,
    teamName: meeting.teams?.name || null,
    attendees: meeting.meeting_type === '1:1' && meeting.people?.full_name
      ? [meeting.people.full_name]
      : meeting.meeting_type !== 'Other' && meeting.teams?.name
      ? [meeting.teams.name]
      : [],
    createdAt: meeting.created_at,
    updatedAt: meeting.updated_at,
  }))
}

/**
 * Create a new meeting
 */
export async function createMeeting(meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt' | 'personName' | 'teamName' | 'attendees'>): Promise<Meeting> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('meetings')
    .insert({
      title: meeting.title,
      meeting_type: meeting.meetingType,
      meeting_date: meeting.meetingDate,
      next_meeting_date: meeting.nextMeetingDate || null,
      recurrence: meeting.recurrence || null,
      action_items: meeting.actionItems || null,
      notes: meeting.notes || null,
      person_id: meeting.personId || null,
      team_id: meeting.teamId || null,
      owning_user_id: user.id,
    } as any)
    .select(`
      *,
      people(full_name),
      teams(name)
    `)
    .single()

  if (error) throw error

  return {
    id: (data as any).id,
    title: (data as any).title,
    meetingType: (data as any).meeting_type,
    meetingDate: (data as any).meeting_date,
    nextMeetingDate: (data as any).next_meeting_date,
    recurrence: (data as any).recurrence,
    actionItems: (data as any).action_items,
    notes: (data as any).notes,
    personId: (data as any).person_id,
    personName: (data as any).people?.full_name || null,
    teamId: (data as any).team_id,
    teamName: (data as any).teams?.name || null,
    attendees: (data as any).meeting_type === '1:1' && (data as any).people?.full_name
      ? [(data as any).people.full_name]
      : (data as any).meeting_type !== 'Other' && (data as any).teams?.name
      ? [(data as any).teams.name]
      : [],
    createdAt: (data as any).created_at,
    updatedAt: (data as any).updated_at,
  }
}

/**
 * Update an existing meeting
 */
export async function updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting> {
  const supabase = createClient()

  const dbUpdates: any = {}
  if (updates.title !== undefined) dbUpdates.title = updates.title
  if (updates.meetingType !== undefined) dbUpdates.meeting_type = updates.meetingType
  if (updates.meetingDate !== undefined) dbUpdates.meeting_date = updates.meetingDate
  if (updates.nextMeetingDate !== undefined) dbUpdates.next_meeting_date = updates.nextMeetingDate || null
  if (updates.recurrence !== undefined) dbUpdates.recurrence = updates.recurrence || null
  if (updates.actionItems !== undefined) dbUpdates.action_items = updates.actionItems || null
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null
  if (updates.personId !== undefined) dbUpdates.person_id = updates.personId || null
  if (updates.teamId !== undefined) dbUpdates.team_id = updates.teamId || null

  const { data, error } = await (supabase
    .from('meetings') as any)
    .update(dbUpdates)
    .eq('id', id)
    .select(`
      *,
      people(full_name),
      teams(name)
    `)
    .single()

  if (error) throw error

  return {
    id: (data as any).id,
    title: (data as any).title,
    meetingType: (data as any).meeting_type,
    meetingDate: (data as any).meeting_date,
    nextMeetingDate: (data as any).next_meeting_date,
    recurrence: (data as any).recurrence,
    actionItems: (data as any).action_items,
    notes: (data as any).notes,
    personId: (data as any).person_id,
    personName: (data as any).people?.full_name || null,
    teamId: (data as any).team_id,
    teamName: (data as any).teams?.name || null,
    attendees: (data as any).meeting_type === '1:1' && (data as any).people?.full_name
      ? [(data as any).people.full_name]
      : (data as any).meeting_type !== 'Other' && (data as any).teams?.name
      ? [(data as any).teams.name]
      : [],
    createdAt: (data as any).created_at,
    updatedAt: (data as any).updated_at,
  }
}

/**
 * Delete a meeting
 */
export async function deleteMeeting(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Get meetings for a specific person (1:1s)
 */
export async function getMeetingsForPerson(personId: string): Promise<Meeting[]> {
  const supabase = createClient()

  const { data: meetings, error } = await supabase
    .from('meetings')
    .select(`
      *,
      people(full_name),
      teams(name)
    `)
    .eq('person_id', personId)
    .order('meeting_date', { ascending: false })

  if (error) throw error

  return meetings.map((meeting: any) => ({
    id: meeting.id,
    title: meeting.title,
    meetingType: meeting.meeting_type,
    meetingDate: meeting.meeting_date,
    nextMeetingDate: meeting.next_meeting_date,
    recurrence: meeting.recurrence,
    actionItems: meeting.action_items,
    notes: meeting.notes,
    personId: meeting.person_id,
    personName: meeting.people?.full_name || null,
    teamId: meeting.team_id,
    teamName: meeting.teams?.name || null,
    attendees: meeting.people?.full_name ? [meeting.people.full_name] : [],
    createdAt: meeting.created_at,
    updatedAt: meeting.updated_at,
  }))
}

/**
 * Get meetings for a specific team
 */
export async function getMeetingsForTeam(teamId: string): Promise<Meeting[]> {
  const supabase = createClient()

  const { data: meetings, error } = await supabase
    .from('meetings')
    .select(`
      *,
      people(full_name),
      teams(name)
    `)
    .eq('team_id', teamId)
    .order('meeting_date', { ascending: false })

  if (error) throw error

  return meetings.map((meeting: any) => ({
    id: meeting.id,
    title: meeting.title,
    meetingType: meeting.meeting_type,
    meetingDate: meeting.meeting_date,
    nextMeetingDate: meeting.next_meeting_date,
    recurrence: meeting.recurrence,
    actionItems: meeting.action_items,
    notes: meeting.notes,
    personId: meeting.person_id,
    personName: meeting.people?.full_name || null,
    teamId: meeting.team_id,
    teamName: meeting.teams?.name || null,
    attendees: meeting.teams?.name ? [meeting.teams.name] : [],
    createdAt: meeting.created_at,
    updatedAt: meeting.updated_at,
  }))
}
