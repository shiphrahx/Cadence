/**
 * Tasks Service
 * Handles all database operations for tasks
 */

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'
import type { Task, TaskStatus, TaskPriority } from '@/lib/types/task'

type TaskRow = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

// Determine list based on due date — only 'week' if due within the next 7 days
function resolveList(dueDate: string | null): 'week' | 'backlog' {
  if (!dueDate) return 'backlog'
  const due = new Date(dueDate)
  const now = new Date()
  const sevenDaysFromNow = new Date(now)
  sevenDaysFromNow.setDate(now.getDate() + 7)
  return due <= sevenDaysFromNow ? 'week' : 'backlog'
}

// Map database status to UI status
function mapDbStatusToUi(status: 'open' | 'completed'): TaskStatus {
  return status === 'completed' ? 'Done' : 'Not started'
}

// Map UI status to database status
function mapUiStatusToDb(status: TaskStatus): 'open' | 'completed' {
  return status === 'Done' ? 'completed' : 'open'
}

// Map database priority to UI priority
function mapDbPriorityToUi(priority: 'low' | 'medium' | 'high' | 'very_high'): TaskPriority {
  const map: Record<string, TaskPriority> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    very_high: 'Very High'
  }
  return map[priority] || 'Medium'
}

// Map UI priority to database priority
function mapUiPriorityToDb(priority: TaskPriority): 'low' | 'medium' | 'high' | 'very_high' {
  const map: Record<TaskPriority, 'low' | 'medium' | 'high' | 'very_high'> = {
    'Low': 'low',
    'Medium': 'medium',
    'High': 'high',
    'Very High': 'very_high'
  }
  return map[priority] || 'medium'
}

/**
 * Get all tasks for the current user
 */
export async function getTasks(): Promise<Task[]> {
  const supabase = createClient()

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      *,
      task_relations(
        entity_type,
        entity_id
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  return tasks.map((task: any) => ({
    id: task.id,
    title: task.title,
    description: task.description || undefined,
    dueDate: task.due_date,
    priority: mapDbPriorityToUi(task.priority),
    category: 'Task', // Default category for now
    status: mapDbStatusToUi(task.status),
    list: (task.list as 'week' | 'backlog') || resolveList(task.due_date),
  }))
}

/**
 * Create a new task
 */
export async function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: task.title,
      description: task.description || null,
      due_date: task.dueDate || null,
      priority: mapUiPriorityToDb(task.priority),
      status: mapUiStatusToDb(task.status),
      list: task.list || resolveList(task.dueDate || null),
      source: 'manual',
      owning_user_id: user.id,
    } as any)
    .select()
    .single()

  if (error) throw error

  return {
    id: (data as any).id,
    title: (data as any).title,
    description: (data as any).description || undefined,
    dueDate: (data as any).due_date,
    priority: mapDbPriorityToUi((data as any).priority),
    category: 'Task',
    status: mapDbStatusToUi((data as any).status),
    list: (data as any).list || resolveList((data as any).due_date),
  }
}

/**
 * Update an existing task
 */
export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const supabase = createClient()

  const dbUpdates: any = {}
  if (updates.title !== undefined) dbUpdates.title = updates.title
  if (updates.description !== undefined) dbUpdates.description = updates.description || null
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate || null
  if (updates.priority !== undefined) dbUpdates.priority = mapUiPriorityToDb(updates.priority)
  if (updates.list !== undefined) dbUpdates.list = updates.list
  if (updates.status !== undefined) {
    dbUpdates.status = mapUiStatusToDb(updates.status)
    // Set completion date if marking as done
    if (updates.status === 'Done') {
      dbUpdates.completion_date = new Date().toISOString().split('T')[0]
    } else {
      dbUpdates.completion_date = null
    }
  }

  const { data, error } = await (supabase
    .from('tasks') as any)
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return {
    id: (data as any).id,
    title: (data as any).title,
    description: (data as any).description || undefined,
    dueDate: (data as any).due_date,
    priority: mapDbPriorityToUi((data as any).priority),
    category: 'Task',
    status: mapDbStatusToUi((data as any).status),
    list: (data as any).list || resolveList((data as any).due_date),
  }
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Move task between lists (week/backlog)
 */
export async function moveTask(id: string, toList: 'week' | 'backlog'): Promise<Task> {
  return updateTask(id, { list: toList })
}
