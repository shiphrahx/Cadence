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
        },
        {
          id: '2',
          name: 'Product Team',
          description: 'Product development',
          status: 'active',
          created_at: '2024-01-02T00:00:00Z',
        },
      ]

      const mockMemberships = [
        { team_id: '1', person_id: 'p1' },
        { team_id: '1', person_id: 'p2' },
        { team_id: '1', person_id: 'p3' },
        { team_id: '1', person_id: 'p4' },
        { team_id: '1', person_id: 'p5' },
        { team_id: '2', person_id: 'p1' },
        { team_id: '2', person_id: 'p2' },
        { team_id: '2', person_id: 'p3' },
      ]

      // getTeams does two parallel queries: teams and team_memberships
      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'teams') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockTeams, error: null }),
            }),
          }
        }
        if (table === 'team_memberships') {
          return {
            select: vi.fn().mockResolvedValue({ data: mockMemberships, error: null }),
          }
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) }
      })

      const teams = await getTeams()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('teams')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('team_memberships')
      expect(teams).toHaveLength(2)
      expect(teams[0]).toMatchObject({
        id: '1',
        name: 'Platform Engineering',
        memberCount: 5,
        status: 'active',
      })
      expect(teams[0].memberIds).toEqual(['p1', 'p2', 'p3', 'p4', 'p5'])
      expect(teams[1].memberCount).toBe(3)
    })

    it('should throw error when fetching teams fails', async () => {
      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'teams') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
            }),
          }
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

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
        memberIds: [],
        createdAt: '',
      }

      const mockCreatedTeam = {
        id: 'new-team-id',
        name: 'New Team',
        description: 'Team description',
        status: 'active',
        created_at: '2024-01-03T00:00:00Z',
      }

      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'teams') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockCreatedTeam, error: null }),
              }),
            }),
          }
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) }
      })

      const result = await createTeam(newTeam)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('teams')
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
      }

      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'teams') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockUpdatedTeam, error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'team_memberships') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) }
      })

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
      }

      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'teams') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockUpdatedTeam, error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'team_memberships') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) }
      })

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
      }

      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'teams') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockUpdatedTeam, error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'team_memberships') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) }
      })

      const result = await toggleTeamStatus('team-1', 'inactive')

      expect(result.status).toBe('active')
    })
  })
})
