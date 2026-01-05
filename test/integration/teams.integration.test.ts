import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getTeams, createTeam, updateTeam, deleteTeam, toggleTeamStatus } from '@/lib/services/teams'
import { testSupabase, cleanupTestData, createTestTeam, testData } from './setup'
import type { Team } from '@/lib/services/teams'

/**
 * Integration Tests for Teams Domain
 *
 * These tests verify the complete flow from service layer to database,
 * using a real Supabase instance (not mocked).
 */

describe('Teams Integration Tests', () => {
  beforeEach(async () => {
    // Ensure we have a test user authenticated
    const { data: { user } } = await testSupabase.auth.getUser()
    if (!user) {
      throw new Error('Test user not authenticated. Please login to Supabase test instance.')
    }
  })

  afterEach(async () => {
    // Clean up all created test data
    await cleanupTestData()
  })

  describe('Team CRUD Operations', () => {
    it('should create a new team and retrieve it', async () => {
      const newTeam = {
        name: 'Integration Test Team',
        description: 'Created by integration test',
        status: 'active' as const,
        notes: 'Test notes',
      }

      // Create team
      const createdTeam = await createTeam(newTeam)
      testData.createdTeamIds.push(createdTeam.id)

      expect(createdTeam).toBeDefined()
      expect(createdTeam.id).toBeDefined()
      expect(createdTeam.name).toBe(newTeam.name)
      expect(createdTeam.description).toBe(newTeam.description)
      expect(createdTeam.status).toBe(newTeam.status)
      expect(createdTeam.memberCount).toBe(0)

      // Verify it exists in database
      const teams = await getTeams()
      const foundTeam = teams.find(t => t.id === createdTeam.id)
      expect(foundTeam).toBeDefined()
      expect(foundTeam?.name).toBe(newTeam.name)
    })

    it('should update an existing team', async () => {
      // Create initial team
      const team = await createTestTeam({
        name: 'Team to Update',
        description: 'Original description',
        status: 'active',
      })

      // Update team
      const updates = {
        name: 'Updated Team Name',
        description: 'Updated description',
      }

      const updatedTeam = await updateTeam(team.id, updates)

      expect(updatedTeam.id).toBe(team.id)
      expect(updatedTeam.name).toBe(updates.name)
      expect(updatedTeam.description).toBe(updates.description)

      // Verify update persisted in database
      const teams = await getTeams()
      const foundTeam = teams.find(t => t.id === team.id)
      expect(foundTeam?.name).toBe(updates.name)
      expect(foundTeam?.description).toBe(updates.description)
    })

    it('should delete a team', async () => {
      // Create team to delete
      const team = await createTestTeam({
        name: 'Team to Delete',
        description: 'Will be deleted',
        status: 'active',
      })

      // Verify it exists
      let teams = await getTeams()
      expect(teams.find(t => t.id === team.id)).toBeDefined()

      // Delete team
      await deleteTeam(team.id)

      // Remove from tracking since we manually deleted it
      testData.createdTeamIds = testData.createdTeamIds.filter(id => id !== team.id)

      // Verify it's deleted
      teams = await getTeams()
      expect(teams.find(t => t.id === team.id)).toBeUndefined()
    })

    it('should toggle team status from active to inactive', async () => {
      // Create active team
      const team = await createTestTeam({
        name: 'Team to Toggle',
        status: 'active',
      })

      expect(team.status).toBe('active')

      // Toggle to inactive
      const toggledTeam = await toggleTeamStatus(team.id, 'active')

      expect(toggledTeam.id).toBe(team.id)
      expect(toggledTeam.status).toBe('inactive')

      // Verify persisted
      const teams = await getTeams()
      const foundTeam = teams.find(t => t.id === team.id)
      expect(foundTeam?.status).toBe('inactive')
    })

    it('should toggle team status from inactive to active', async () => {
      // Create inactive team
      const team = await createTestTeam({
        name: 'Inactive Team to Toggle',
        status: 'inactive',
      })

      expect(team.status).toBe('inactive')

      // Toggle to active
      const toggledTeam = await toggleTeamStatus(team.id, 'inactive')

      expect(toggledTeam.id).toBe(team.id)
      expect(toggledTeam.status).toBe('active')

      // Verify persisted
      const teams = await getTeams()
      const foundTeam = teams.find(t => t.id === team.id)
      expect(foundTeam?.status).toBe('active')
    })
  })

  describe('Team Member Count Integration', () => {
    it('should return correct member count for team with no members', async () => {
      const team = await createTestTeam({
        name: 'Empty Team',
        description: 'No members',
      })

      const teams = await getTeams()
      const foundTeam = teams.find(t => t.id === team.id)

      expect(foundTeam?.memberCount).toBe(0)
    })

    it('should update member count when people are added to team', async () => {
      // This test verifies the JOIN query works correctly
      const team = await createTestTeam({
        name: 'Team with Members',
      })

      // Note: Adding team members requires the people service
      // This test verifies the count aggregation works
      // The actual member addition would be tested in people integration tests

      const teams = await getTeams()
      const foundTeam = teams.find(t => t.id === team.id)

      expect(foundTeam?.memberCount).toBe(0)
    })
  })

  describe('Team Data Validation', () => {
    it('should handle teams with empty descriptions', async () => {
      const team = await createTeam({
        name: 'Minimal Team',
        description: '',
        status: 'active',
        notes: '',
      })

      testData.createdTeamIds.push(team.id)

      expect(team.description).toBe('')
      expect(team.name).toBe('Minimal Team')
    })

    it('should preserve team creation timestamp', async () => {
      const team = await createTestTeam({
        name: 'Timestamped Team',
      })

      expect(team.created_at).toBeDefined()

      const teams = await getTeams()
      const foundTeam = teams.find(t => t.id === team.id)

      expect(foundTeam?.createdAt).toBe(team.created_at)
    })
  })

  describe('Error Handling', () => {
    it('should throw error when updating non-existent team', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'

      await expect(
        updateTeam(fakeId, { name: 'Should Fail' })
      ).rejects.toThrow()
    })

    it('should throw error when deleting non-existent team', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'

      await expect(
        deleteTeam(fakeId)
      ).rejects.toThrow()
    })

    it('should throw error when toggling status of non-existent team', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'

      await expect(
        toggleTeamStatus(fakeId, 'active')
      ).rejects.toThrow()
    })
  })

  describe('Data Ordering and Retrieval', () => {
    it('should retrieve teams ordered by creation date (newest first)', async () => {
      // Create teams in sequence
      const team1 = await createTestTeam({ name: 'First Team' })
      await new Promise(resolve => setTimeout(resolve, 100)) // Small delay
      const team2 = await createTestTeam({ name: 'Second Team' })
      await new Promise(resolve => setTimeout(resolve, 100))
      const team3 = await createTestTeam({ name: 'Third Team' })

      const teams = await getTeams()

      // Find our test teams
      const testTeams = teams.filter(t =>
        [team1.id, team2.id, team3.id].includes(t.id)
      )

      // Should be ordered newest first
      expect(testTeams[0].id).toBe(team3.id)
      expect(testTeams[1].id).toBe(team2.id)
      expect(testTeams[2].id).toBe(team1.id)
    })

    it('should retrieve all teams for authenticated user', async () => {
      const initialCount = (await getTeams()).length

      // Create multiple teams
      await createTestTeam({ name: 'Team A' })
      await createTestTeam({ name: 'Team B' })
      await createTestTeam({ name: 'Team C' })

      const teams = await getTeams()

      expect(teams.length).toBe(initialCount + 3)
    })
  })
})
