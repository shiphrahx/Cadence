/**
 * Meeting Templates Service
 * Handles all database operations for meeting templates
 */

import { createClient } from '@/lib/supabase/client'
import { MeetingTemplate } from '@/lib/hooks/use-templates'

export async function getTemplates(): Promise<{ active: MeetingTemplate[]; deleted: MeetingTemplate[] }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('meeting_templates')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error

  const active: MeetingTemplate[] = []
  const deleted: MeetingTemplate[] = []

  for (const row of data ?? []) {
    const template: MeetingTemplate = {
      id: row.id,
      name: row.name,
      notes: row.notes,
    }
    if (row.is_deleted) {
      deleted.push(template)
    } else {
      active.push(template)
    }
  }

  return { active, deleted }
}

export async function createTemplate(template: Omit<MeetingTemplate, 'id'>): Promise<MeetingTemplate> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('meeting_templates')
    .insert({
      name: template.name,
      notes: template.notes,
      owning_user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    name: data.name,
    notes: data.notes,
  }
}

export async function updateTemplate(id: string, updates: Partial<Omit<MeetingTemplate, 'id'>>): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('meeting_templates')
    .update({ name: updates.name, notes: updates.notes })
    .eq('id', id)

  if (error) throw error
}

export async function softDeleteTemplate(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('meeting_templates')
    .update({ is_deleted: true })
    .eq('id', id)

  if (error) throw error
}

export async function restoreTemplate(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('meeting_templates')
    .update({ is_deleted: false })
    .eq('id', id)

  if (error) throw error
}

export async function seedDefaultTemplates(defaults: MeetingTemplate[]): Promise<MeetingTemplate[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('meeting_templates')
    .insert(
      defaults.map(t => ({
        name: t.name,
        notes: t.notes,
        owning_user_id: user.id,
      }))
    )
    .select()

  if (error) throw error

  return (data ?? []).map(row => ({
    id: row.id,
    name: row.name,
    notes: row.notes,
  }))
}
