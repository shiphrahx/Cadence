/**
 * People Service
 * Handles all database operations for people
 */

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type PersonRow = Database['public']['Tables']['people']['Row']
type PersonInsert = Database['public']['Tables']['people']['Insert']
type PersonUpdate = Database['public']['Tables']['people']['Update']

export interface Person {
  id: string
  name: string
  role: string | null
  level: string | null
  startDate: string | null
  notes: string | null
  status: 'active' | 'inactive'
  teams: string[]
  createdAt: string
}

/**
 * Get all people for the current user
 */
export async function getPeople(): Promise<Person[]> {
  const supabase = createClient()

  const [{ data: people, error }, { data: memberships }] = await Promise.all([
    supabase.from('people').select('*').order('created_at', { ascending: false }),
    supabase.from('team_memberships').select('person_id, teams(name)'),
  ])

  if (error) throw error

  // Build a map of person_id -> team names from the memberships query
  const teamsByPerson: Record<string, string[]> = {}
  for (const m of (memberships ?? []) as any[]) {
    const name = m.teams?.name
    if (!name) continue
    if (!teamsByPerson[m.person_id]) teamsByPerson[m.person_id] = []
    teamsByPerson[m.person_id].push(name)
  }

  return (people ?? []).map((person: any) => ({
    id: person.id,
    name: person.full_name,
    role: person.role,
    level: person.level,
    startDate: person.start_date,
    notes: person.notes,
    status: person.status,
    teams: teamsByPerson[person.id] ?? [],
    createdAt: person.created_at,
  }))
}

/**
 * Create a new person, including team memberships
 */
export async function createPerson(person: Omit<Person, 'id' | 'createdAt'> & { teams?: string[] }): Promise<Person> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('people')
    .insert({
      full_name: person.name,
      role: person.role || null,
      level: person.level || null,
      start_date: person.startDate || null,
      notes: person.notes || null,
      status: person.status || 'active',
      owning_user_id: user.id,
    } as any)
    .select()
    .single()

  if (error) throw error

  const personId = (data as any).id
  const teamNames = person.teams ?? []

  if (teamNames.length > 0) {
    const { data: allTeams } = await supabase.from('teams').select('id, name')
    const teamNameToId = Object.fromEntries((allTeams ?? []).map((t: any) => [t.name, t.id]))
    const teamIds = teamNames.map(name => teamNameToId[name]).filter(Boolean)
    if (teamIds.length > 0) {
      await supabase.from('team_memberships').insert(
        teamIds.map((team_id: string) => ({ person_id: personId, team_id } as any))
      )
    }
  }

  return {
    id: personId,
    name: (data as any).full_name,
    role: (data as any).role,
    level: (data as any).level,
    startDate: (data as any).start_date,
    notes: (data as any).notes,
    status: (data as any).status,
    teams: teamNames,
    createdAt: (data as any).created_at,
  }
}

/**
 * Update an existing person, including syncing team memberships
 */
export async function updatePerson(id: string, updates: Partial<Person>): Promise<Person> {
  const supabase = createClient()

  // Build update payload — only include fields that were explicitly provided
  const payload: Record<string, unknown> = {}
  if (updates.name !== undefined) payload.full_name = updates.name
  if (updates.role !== undefined) payload.role = updates.role || null
  if (updates.level !== undefined) payload.level = updates.level || null
  if (updates.startDate !== undefined) payload.start_date = updates.startDate || null
  if (updates.notes !== undefined) payload.notes = updates.notes || null
  if (updates.status !== undefined) payload.status = updates.status

  // Update person fields
  const { data, error } = await (supabase.from('people') as any)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error

  // Sync team memberships if teams were provided
  if (updates.teams !== undefined) {
    // Resolve team names -> IDs
    const { data: allTeams } = await supabase.from('teams').select('id, name')
    const teamNameToId = Object.fromEntries((allTeams ?? []).map((t: any) => [t.name, t.id]))
    const desiredTeamIds = updates.teams.map(name => teamNameToId[name]).filter(Boolean)

    // Get current memberships
    const { data: currentMemberships } = await supabase
      .from('team_memberships').select('team_id').eq('person_id', id)
    const currentTeamIds = (currentMemberships ?? []).map((m: any) => m.team_id)

    // Add missing memberships
    const toAdd = desiredTeamIds.filter((tid: string) => !currentTeamIds.includes(tid))
    if (toAdd.length > 0) {
      await supabase.from('team_memberships').insert(
        toAdd.map((team_id: string) => ({ person_id: id, team_id } as any))
      )
    }

    // Remove memberships no longer wanted
    const toRemove = currentTeamIds.filter((tid: string) => !desiredTeamIds.includes(tid))
    if (toRemove.length > 0) {
      await supabase.from('team_memberships')
        .delete()
        .eq('person_id', id)
        .in('team_id', toRemove)
    }
  }

  // Fetch final memberships to return accurate teams list
  const { data: memberships } = await supabase
    .from('team_memberships').select('teams(name)').eq('person_id', id)

  return {
    id: (data as any).id,
    name: (data as any).full_name,
    role: (data as any).role,
    level: (data as any).level,
    startDate: (data as any).start_date,
    notes: (data as any).notes,
    status: (data as any).status,
    teams: ((memberships ?? []) as any[]).map((m: any) => m.teams?.name).filter(Boolean),
    createdAt: (data as any).created_at,
  }
}

/**
 * Delete a person
 */
export async function deletePerson(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Toggle person status (active/inactive)
 */
export async function togglePersonStatus(id: string, currentStatus: 'active' | 'inactive'): Promise<Person> {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  return updatePerson(id, { status: newStatus })
}

/**
 * Add person to team
 */
export async function addPersonToTeam(personId: string, teamId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('team_memberships')
    .insert({
      person_id: personId,
      team_id: teamId,
    } as any)

  if (error) throw error
}

/**
 * Remove person from team
 */
export async function removePersonFromTeam(personId: string, teamId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('team_memberships')
    .delete()
    .eq('person_id', personId)
    .eq('team_id', teamId)

  if (error) throw error
}
