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

  const { data: teams, error } = await supabase
    .from('teams')
    .select(`
      *,
      team_memberships(count)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Transform database rows to Team interface
  return teams.map((team: any) => ({
    id: team.id,
    name: team.name,
    description: team.description || '',
    status: team.status,
    memberCount: team.team_memberships[0]?.count || 0,
    createdAt: team.created_at,
    notes: team.description,
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
      owning_user_id: user.id,
    } as any)
    .select()
    .single()

  if (error) throw error

  return {
    id: (data as any).id,
    name: (data as any).name,
    description: (data as any).description || '',
    status: (data as any).status,
    memberCount: 0,
    createdAt: (data as any).created_at,
    notes: (data as any).description,
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
    })
    .eq('id', id)
    .select(`
      *,
      team_memberships(count)
    `)
    .single()

  if (error) throw error

  return {
    id: (data as any).id,
    name: (data as any).name,
    description: (data as any).description || '',
    status: (data as any).status,
    memberCount: (data as any).team_memberships[0]?.count || 0,
    createdAt: (data as any).created_at,
    notes: (data as any).description,
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
