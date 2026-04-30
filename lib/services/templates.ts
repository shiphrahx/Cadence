/**
 * Meeting Templates Service
 * Handles all database operations for meeting templates
 */

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'
import { MeetingTemplate } from '@/lib/hooks/use-templates'

type TemplateRow = Database['public']['Tables']['meeting_templates']['Row']
type TemplateInsert = Database['public']['Tables']['meeting_templates']['Insert']
type TemplateUpdate = Database['public']['Tables']['meeting_templates']['Update']

function rowToTemplate(row: TemplateRow): MeetingTemplate {
  return { id: row.id, name: row.name, notes: row.notes }
}

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
    if (row.is_deleted) {
      deleted.push(rowToTemplate(row))
    } else {
      active.push(rowToTemplate(row))
    }
  }

  return { active, deleted }
}

export async function createTemplate(template: Omit<MeetingTemplate, 'id'>): Promise<MeetingTemplate> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const insert: TemplateInsert = {
    name: template.name,
    notes: template.notes,
    owning_user_id: user.id,
  }

  const { data, error } = await supabase
    .from('meeting_templates')
    .insert(insert)
    .select()
    .single()

  if (error) throw error

  return rowToTemplate(data)
}

export async function updateTemplate(id: string, updates: Partial<Omit<MeetingTemplate, 'id'>>): Promise<void> {
  const supabase = createClient()

  const patch: TemplateUpdate = { name: updates.name, notes: updates.notes }

  const { error } = await supabase
    .from('meeting_templates')
    .update(patch)
    .eq('id', id)

  if (error) throw error
}

export async function softDeleteTemplate(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('meeting_templates')
    .update({ is_deleted: true } satisfies TemplateUpdate)
    .eq('id', id)

  if (error) throw error
}

export async function restoreTemplate(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('meeting_templates')
    .update({ is_deleted: false } satisfies TemplateUpdate)
    .eq('id', id)

  if (error) throw error
}

export async function seedDefaultTemplates(defaults: MeetingTemplate[]): Promise<MeetingTemplate[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const inserts: TemplateInsert[] = defaults.map((t) => ({
    name: t.name,
    notes: t.notes,
    owning_user_id: user.id,
  }))

  const { data, error } = await supabase
    .from('meeting_templates')
    .insert(inserts)
    .select()

  if (error) throw error

  return (data ?? []).map(rowToTemplate)
}
