/**
 * Teams Service
 * Handles all database operations for teams
 */

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type TeamRow = Database['public']['Tables']['teams']['Row']
type TeamInsert = Database['public']['Tables']['teams']['Insert']
type TeamUpdate = Database['public']['Tables']['teams']['Update']

export interface Team {
  id: string
  name: string
  description: string | null
  status: 'active' | 'inactive'
  memberCount: number
  createdAt: string
  memberIds?: string[]
  notes?: string
  documentationUrl?: string
}

/**
 * Get all teams for the current user
 */
export async function getTeams(): Promise<Team[]> {
  const supabase = createClient()

  const [{ data: teams, error }, { data: memberships }] = await Promise.all([
    supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('team_memberships')
      .select('team_id, person_id'),
  ])

  if (error) throw error

  // Build a map of team_id -> person_ids and counts
  const membersByTeam: Record<string, string[]> = {}
  for (const m of (memberships ?? []) as any[]) {
    if (!membersByTeam[m.team_id]) membersByTeam[m.team_id] = []
    membersByTeam[m.team_id].push(m.person_id)
  }

  return (teams ?? []).map((team: any) => ({
    id: team.id,
    name: team.name,
    description: team.description || '',
    status: team.status,
    memberCount: membersByTeam[team.id]?.length ?? 0,
    memberIds: membersByTeam[team.id] ?? [],
    createdAt: team.created_at,
    notes: team.notes || '',
    documentationUrl: team.documentation_url || '',
  }))
}

/**
 * Create a new team
 */
export async function createTeam(team: Omit<Team, 'id' | 'memberCount' | 'createdAt'>): Promise<Team> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('teams')
    .insert({
      name: team.name,
      description: team.description || null,
      status: team.status || 'active',
      notes: team.notes || null,
      documentation_url: team.documentationUrl || null,
      owning_user_id: user.id,
    } as any)
    .select()
    .single()

  if (error) throw error

  const teamId = (data as any).id
  const memberIds = team.memberIds ?? []

  if (memberIds.length > 0) {
    await (supabase.from('team_memberships') as any).insert(
      memberIds.map((person_id: string) => ({ team_id: teamId, person_id }))
    )
  }

  return {
    id: teamId,
    name: (data as any).name,
    description: (data as any).description || '',
    status: (data as any).status,
    memberCount: memberIds.length,
    memberIds,
    createdAt: (data as any).created_at,
    notes: (data as any).notes || '',
    documentationUrl: (data as any).documentation_url || '',
  }
}

/**
 * Update an existing team
 */
export async function updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
  const supabase = createClient()

  const { data, error } = await (supabase
    .from('teams') as any)
    .update({
      name: updates.name,
      description: updates.description || null,
      status: updates.status,
      notes: updates.notes ?? null,
      documentation_url: updates.documentationUrl ?? null,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error

  // Sync team memberships if memberIds were provided
  if (updates.memberIds !== undefined) {
    const desiredIds = updates.memberIds

    const { data: currentMemberships } = await supabase
      .from('team_memberships')
      .select('person_id')
      .eq('team_id', id)
    const currentIds = (currentMemberships ?? []).map((m: any) => m.person_id)

    const toAdd = desiredIds.filter((pid: string) => !currentIds.includes(pid))
    if (toAdd.length > 0) {
      await (supabase.from('team_memberships') as any).insert(
        toAdd.map((person_id: string) => ({ team_id: id, person_id }))
      )
    }

    const toRemove = currentIds.filter((pid: string) => !desiredIds.includes(pid))
    if (toRemove.length > 0) {
      await supabase.from('team_memberships')
        .delete()
        .eq('team_id', id)
        .in('person_id', toRemove)
    }
  }

  // Fetch final membership ids
  const { data: finalMemberships } = await supabase
    .from('team_memberships')
    .select('person_id')
    .eq('team_id', id)
  const memberIds = (finalMemberships ?? []).map((m: any) => m.person_id)

  return {
    id: (data as any).id,
    name: (data as any).name,
    description: (data as any).description || '',
    status: (data as any).status,
    memberCount: memberIds.length,
    memberIds,
    createdAt: (data as any).created_at,
    notes: (data as any).notes || '',
    documentationUrl: (data as any).documentation_url || '',
  }
}

/**
 * Delete a team
 */
export async function deleteTeam(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Toggle team status (active/inactive)
 */
export async function toggleTeamStatus(id: string, currentStatus: 'active' | 'inactive'): Promise<Team> {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  return updateTeam(id, { status: newStatus })
}
