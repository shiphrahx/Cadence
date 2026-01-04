import { beforeAll, afterAll, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

/**
 * Integration Test Setup
 *
 * This file sets up the test environment for integration tests.
 * Integration tests use a real Supabase test instance (not mocked).
 */

// Test Supabase client (uses same instance as dev, but with test user)
export const testSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Store created IDs for cleanup
export const testData = {
  createdTeamIds: [] as string[],
  createdPeopleIds: [] as string[],
  createdTaskIds: [] as string[],
}

/**
 * Clean up all test data created during integration tests
 */
export async function cleanupTestData() {
  // Delete tasks
  if (testData.createdTaskIds.length > 0) {
    await testSupabase
      .from('tasks')
      .delete()
      .in('id', testData.createdTaskIds)
    testData.createdTaskIds = []
  }

  // Delete team memberships (must be deleted before people and teams)
  const { data: memberships } = await testSupabase
    .from('team_memberships')
    .select('id')
    .or(
      `person_id.in.(${testData.createdPeopleIds.join(',')}),` +
      `team_id.in.(${testData.createdTeamIds.join(',')})`
    )

  if (memberships && memberships.length > 0) {
    await testSupabase
      .from('team_memberships')
      .delete()
      .in('id', memberships.map(m => m.id))
  }

  // Delete people
  if (testData.createdPeopleIds.length > 0) {
    await testSupabase
      .from('people')
      .delete()
      .in('id', testData.createdPeopleIds)
    testData.createdPeopleIds = []
  }

  // Delete teams
  if (testData.createdTeamIds.length > 0) {
    await testSupabase
      .from('teams')
      .delete()
      .in('id', testData.createdTeamIds)
    testData.createdTeamIds = []
  }
}

/**
 * Create a test team and track it for cleanup
 */
export async function createTestTeam(teamData: {
  name: string
  description?: string
  status?: 'active' | 'inactive'
}) {
  const { data: user } = await testSupabase.auth.getUser()
  if (!user.user) throw new Error('Test user not authenticated')

  const { data, error } = await testSupabase
    .from('teams')
    .insert({
      name: teamData.name,
      description: teamData.description || '',
      status: teamData.status || 'active',
      user_id: user.user.id,
    })
    .select()
    .single()

  if (error) throw error

  testData.createdTeamIds.push(data.id)
  return data
}

/**
 * Create a test person and track it for cleanup
 */
export async function createTestPerson(personData: {
  name: string
  role?: string | null
  level?: string | null
  startDate?: string | null
  status?: 'active' | 'inactive'
}) {
  const { data: user } = await testSupabase.auth.getUser()
  if (!user.user) throw new Error('Test user not authenticated')

  const { data, error } = await testSupabase
    .from('people')
    .insert({
      full_name: personData.name,
      role: personData.role,
      level: personData.level,
      start_date: personData.startDate,
      status: personData.status || 'active',
      user_id: user.user.id,
    })
    .select()
    .single()

  if (error) throw error

  testData.createdPeopleIds.push(data.id)
  return data
}

/**
 * Create a test task and track it for cleanup
 */
export async function createTestTask(taskData: {
  title: string
  description?: string
  dueDate?: string | null
  priority?: 'low' | 'medium' | 'high' | 'very_high'
  status?: 'open' | 'completed'
}) {
  const { data: user } = await testSupabase.auth.getUser()
  if (!user.user) throw new Error('Test user not authenticated')

  const { data, error } = await testSupabase
    .from('tasks')
    .insert({
      title: taskData.title,
      description: taskData.description,
      due_date: taskData.dueDate,
      priority: taskData.priority || 'medium',
      status: taskData.status || 'open',
      source: 'manual',
      user_id: user.user.id,
    })
    .select()
    .single()

  if (error) throw error

  testData.createdTaskIds.push(data.id)
  return data
}

// Global setup and teardown
beforeAll(() => {
  console.log('🧪 Integration tests starting...')
})

afterAll(async () => {
  await cleanupTestData()
  console.log('✅ Integration tests cleanup complete')
})

// Clean up after each test
beforeEach(() => {
  // Reset test data tracking between tests
  testData.createdTeamIds = []
  testData.createdPeopleIds = []
  testData.createdTaskIds = []
})
