import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getTeams, createTeam, updateTeam, deleteTeam, toggleTeamStatus } from '../teams'
import { mockSupabaseClient } from '../../../test/mocks/supabase'

describe('Teams Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTeams', () => {
    it('should fetch all teams successfully', async () => {
      const mockTeams = [
        {
          id: '1',
          name: 'Platform Engineering',
          description: 'Core platform development',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          team_memberships: [{ count: 5 }],
        },
        {
          id: '2',
          name: 'Product Team',
          description: 'Product development',
          status: 'active',
          created_at: '2024-01-02T00:00:00Z',
          team_memberships: [{ count: 3 }],
        },
      ]

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockTeams,
            error: null,
          }),
        }),
      })

      mockSupabaseClient.from = mockFrom

      const teams = await getTeams()

      expect(mockFrom).toHaveBeenCalledWith('teams')
      expect(teams).toHaveLength(2)
      expect(teams[0]).toMatchObject({
        id: '1',
        name: 'Platform Engineering',
        memberCount: 5,
        status: 'active',
      })
    })

    it('should throw error when fetching teams fails', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      })

      mockSupabaseClient.from = mockFrom

      await expect(getTeams()).rejects.toThrow()
    })
  })

  describe('createTeam', () => {
    it('should create a new team successfully', async () => {
      const newTeam = {
        name: 'New Team',
        description: 'Team description',
        status: 'active' as const,
        memberCount: 0,
        createdAt: '',
      }

      const mockCreatedTeam = {
        id: 'new-team-id',
        name: 'New Team',
        description: 'Team description',
        status: 'active',
        created_at: '2024-01-03T00:00:00Z',
      }

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCreatedTeam,
              error: null,
            }),
          }),
        }),
      })

      mockSupabaseClient.from = mockFrom

      const result = await createTeam(newTeam)

      expect(mockFrom).toHaveBeenCalledWith('teams')
      expect(result).toMatchObject({
        id: 'new-team-id',
        name: 'New Team',
        memberCount: 0,
      })
    })

    it('should throw error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const newTeam = {
        name: 'New Team',
        description: 'Team description',
        status: 'active' as const,
        memberCount: 0,
        createdAt: '',
      }

      await expect(createTeam(newTeam)).rejects.toThrow('Not authenticated')
    })
  })

  describe('updateTeam', () => {
    it('should update a team successfully', async () => {
      const updates = {
        name: 'Updated Team Name',
        description: 'Updated description',
      }

      const mockUpdatedTeam = {
        id: 'team-1',
        name: 'Updated Team Name',
        description: 'Updated description',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        team_memberships: [{ count: 5 }],
      }

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUpdatedTeam,
                error: null,
              }),
            }),
          }),
        }),
      })

      mockSupabaseClient.from = mockFrom

      const result = await updateTeam('team-1', updates)

      expect(result.name).toBe('Updated Team Name')
      expect(result.description).toBe('Updated description')
    })
  })

  describe('deleteTeam', () => {
    it('should delete a team successfully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      })

      mockSupabaseClient.from = mockFrom

      await expect(deleteTeam('team-1')).resolves.not.toThrow()
      expect(mockFrom).toHaveBeenCalledWith('teams')
    })

    it('should throw error when delete fails', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Delete failed' },
          }),
        }),
      })

      mockSupabaseClient.from = mockFrom

      await expect(deleteTeam('team-1')).rejects.toThrow()
    })
  })

  describe('toggleTeamStatus', () => {
    it('should toggle team status from active to inactive', async () => {
      const mockUpdatedTeam = {
        id: 'team-1',
        name: 'Test Team',
        description: 'Description',
        status: 'inactive',
        created_at: '2024-01-01T00:00:00Z',
        team_memberships: [{ count: 3 }],
      }

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUpdatedTeam,
                error: null,
              }),
            }),
          }),
        }),
      })

      mockSupabaseClient.from = mockFrom

      const result = await toggleTeamStatus('team-1', 'active')

      expect(result.status).toBe('inactive')
    })

    it('should toggle team status from inactive to active', async () => {
      const mockUpdatedTeam = {
        id: 'team-1',
        name: 'Test Team',
        description: 'Description',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        team_memberships: [{ count: 3 }],
      }

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUpdatedTeam,
                error: null,
              }),
            }),
          }),
        }),
      })

      mockSupabaseClient.from = mockFrom

      const result = await toggleTeamStatus('team-1', 'inactive')

      expect(result.status).toBe('active')
    })
  })
})
