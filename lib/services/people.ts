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

  const { data: people, error } = await supabase
    .from('people')
    .select(`
      *,
      team_memberships(
        team_id,
        teams(name)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Transform database rows to Person interface
  return people.map((person: any) => ({
    id: person.id,
    name: person.full_name,
    role: person.role,
    level: person.level,
    startDate: person.start_date,
    notes: person.notes,
    status: person.status,
    teams: person.team_memberships?.map((tm: any) => tm.teams?.name).filter(Boolean) || [],
    createdAt: person.created_at,
  }))
}

/**
 * Create a new person
 */
export async function createPerson(person: Omit<Person, 'id' | 'createdAt' | 'teams'>): Promise<Person> {
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

  return {
    id: (data as any).id,
    name: (data as any).full_name,
    role: (data as any).role,
    level: (data as any).level,
    startDate: (data as any).start_date,
    notes: (data as any).notes,
    status: (data as any).status,
    teams: [],
    createdAt: (data as any).created_at,
  }
}

/**
 * Update an existing person
 */
export async function updatePerson(id: string, updates: Partial<Person>): Promise<Person> {
  const supabase = createClient()

  const { data, error } = await (supabase
    .from('people') as any)
    .update({
      full_name: updates.name,
      role: updates.role || null,
      level: updates.level || null,
      start_date: updates.startDate || null,
      notes: updates.notes || null,
      status: updates.status,
    })
    .eq('id', id)
    .select(`
      *,
      team_memberships(
        team_id,
        teams(name)
      )
    `)
    .single()

  if (error) throw error

  return {
    id: (data as any).id,
    name: (data as any).full_name,
    role: (data as any).role,
    level: (data as any).level,
    startDate: (data as any).start_date,
    notes: (data as any).notes,
    status: (data as any).status,
    teams: (data as any).team_memberships?.map((tm: any) => tm.teams?.name).filter(Boolean) || [],
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
