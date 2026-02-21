import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getPeople, createPerson, updatePerson, deletePerson, togglePersonStatus } from '../people'
import { mockSupabaseClient } from '../../../test/mocks/supabase'

describe('People Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPeople', () => {
    it('should fetch all people with team memberships successfully', async () => {
      const mockPeople = [
        {
          id: '1',
          full_name: 'John Doe',
          role: 'Software Engineer',
          level: 'Senior',
          start_date: '2023-01-15',
          notes: 'Great team player',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          full_name: 'Jane Smith',
          role: 'Tech Lead',
          level: 'Staff',
          start_date: '2022-06-01',
          notes: null,
          status: 'active',
          created_at: '2024-01-02T00:00:00Z',
        },
      ]

      const mockMemberships = [
        { person_id: '1', teams: { name: 'Platform Engineering' } },
        { person_id: '1', teams: { name: 'Product Team' } },
        { person_id: '2', teams: { name: 'Platform Engineering' } },
      ]

      // getPeople does two parallel queries: people and team_memberships
      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'people') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockPeople, error: null }),
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

      const people = await getPeople()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('people')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('team_memberships')
      expect(people).toHaveLength(2)
      expect(people[0]).toMatchObject({
        id: '1',
        name: 'John Doe',
        role: 'Software Engineer',
        level: 'Senior',
        status: 'active',
        teams: ['Platform Engineering', 'Product Team'],
      })
      expect(people[1].teams).toEqual(['Platform Engineering'])
    })

    it('should handle people with no team memberships', async () => {
      const mockPeople = [
        {
          id: '1',
          full_name: 'Solo Developer',
          role: 'Contractor',
          level: 'Mid',
          start_date: '2024-01-01',
          notes: null,
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'people') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockPeople, error: null }),
            }),
          }
        }
        if (table === 'team_memberships') {
          return {
            select: vi.fn().mockResolvedValue({ data: [], error: null }),
          }
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) }
      })

      const people = await getPeople()

      expect(people[0].teams).toEqual([])
    })

    it('should throw error when fetching people fails', async () => {
      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'people') {
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

      await expect(getPeople()).rejects.toThrow()
    })
  })

  describe('createPerson', () => {
    it('should create a new person successfully', async () => {
      const newPerson = {
        name: 'Alice Johnson',
        role: 'Product Manager',
        level: 'Senior',
        startDate: '2024-03-01',
        notes: 'Joining from competitor',
        status: 'active' as const,
        teams: [],
      }

      const mockCreatedPerson = {
        id: 'new-person-id',
        full_name: 'Alice Johnson',
        role: 'Product Manager',
        level: 'Senior',
        start_date: '2024-03-01',
        notes: 'Joining from competitor',
        status: 'active',
        created_at: '2024-01-03T00:00:00Z',
      }

      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'people') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockCreatedPerson, error: null }),
              }),
            }),
          }
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) }
      })

      const result = await createPerson(newPerson)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('people')
      expect(result).toMatchObject({
        id: 'new-person-id',
        name: 'Alice Johnson',
        role: 'Product Manager',
        level: 'Senior',
        teams: [],
      })
    })

    it('should throw error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const newPerson = {
        name: 'Test Person',
        role: 'Engineer',
        level: 'Junior',
        startDate: '2024-01-01',
        notes: null,
        status: 'active' as const,
        teams: [],
      }

      await expect(createPerson(newPerson)).rejects.toThrow('Not authenticated')

      // Reset for other tests
      mockSupabaseClient.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })
    })

    it('should handle null values correctly', async () => {
      const newPerson = {
        name: 'Minimal Person',
        role: null,
        level: null,
        startDate: null,
        notes: null,
        status: 'active' as const,
        teams: [],
      }

      const mockCreatedPerson = {
        id: 'minimal-id',
        full_name: 'Minimal Person',
        role: null,
        level: null,
        start_date: null,
        notes: null,
        status: 'active',
        created_at: '2024-01-03T00:00:00Z',
      }

      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'people') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockCreatedPerson, error: null }),
              }),
            }),
          }
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) }
      })

      const result = await createPerson(newPerson)

      expect(result.role).toBeNull()
      expect(result.level).toBeNull()
      expect(result.startDate).toBeNull()
    })
  })

  describe('updatePerson', () => {
    it('should update a person successfully', async () => {
      const updates = {
        name: 'John Doe Updated',
        role: 'Senior Software Engineer',
        level: 'Staff',
      }

      const mockUpdatedPerson = {
        id: 'person-1',
        full_name: 'John Doe Updated',
        role: 'Senior Software Engineer',
        level: 'Staff',
        start_date: '2023-01-15',
        notes: 'Great team player',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      }

      // updatePerson calls: people (update), teams (select), team_memberships (select current),
      // team_memberships (insert/delete diffs), team_memberships (final select)
      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'people') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockUpdatedPerson, error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'teams') {
          return {
            select: vi.fn().mockResolvedValue({ data: [], error: null }),
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

      const result = await updatePerson('person-1', updates)

      expect(result.name).toBe('John Doe Updated')
      expect(result.role).toBe('Senior Software Engineer')
      expect(result.level).toBe('Staff')
    })

    it('should preserve team memberships when updating', async () => {
      const updates = { role: 'Updated Role' }

      const mockUpdatedPerson = {
        id: 'person-1',
        full_name: 'John Doe',
        role: 'Updated Role',
        level: 'Senior',
        start_date: '2023-01-15',
        notes: null,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      }

      const finalMemberships = [
        { teams: { name: 'Team A' } },
        { teams: { name: 'Team B' } },
      ]

      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'people') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockUpdatedPerson, error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'teams') {
          return {
            select: vi.fn().mockResolvedValue({ data: [], error: null }),
          }
        }
        if (table === 'team_memberships') {
          // Distinguish the two SELECT calls by the column string:
          //   'team_id'     -> current memberships lookup (returns [])
          //   'teams(name)' -> final memberships fetch (returns finalMemberships)
          return {
            select: vi.fn().mockImplementation((cols: string) => ({
              eq: vi.fn().mockResolvedValue({
                data: cols === 'teams(name)' ? finalMemberships : [],
                error: null,
              }),
            })),
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

      const result = await updatePerson('person-1', updates)

      expect(result.teams).toEqual(['Team A', 'Team B'])
    })
  })

  describe('deletePerson', () => {
    it('should delete a person successfully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      })

      mockSupabaseClient.from = mockFrom

      await expect(deletePerson('person-1')).resolves.not.toThrow()
      expect(mockFrom).toHaveBeenCalledWith('people')
    })

    it('should throw error when delete fails', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Cannot delete person with active tasks' },
          }),
        }),
      })

      mockSupabaseClient.from = mockFrom

      await expect(deletePerson('person-1')).rejects.toThrow()
    })
  })

  describe('togglePersonStatus', () => {
    it('should toggle person status from active to inactive', async () => {
      const mockUpdatedPerson = {
        id: 'person-1',
        full_name: 'John Doe',
        role: 'Engineer',
        level: 'Senior',
        start_date: '2023-01-15',
        notes: null,
        status: 'inactive',
        created_at: '2024-01-01T00:00:00Z',
      }

      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'people') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockUpdatedPerson, error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'teams') {
          return { select: vi.fn().mockResolvedValue({ data: [], error: null }) }
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

      const result = await togglePersonStatus('person-1', 'active')

      expect(result.status).toBe('inactive')
    })

    it('should toggle person status from inactive to active', async () => {
      const mockUpdatedPerson = {
        id: 'person-1',
        full_name: 'John Doe',
        role: 'Engineer',
        level: 'Senior',
        start_date: '2023-01-15',
        notes: null,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      }

      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'people') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockUpdatedPerson, error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'teams') {
          return { select: vi.fn().mockResolvedValue({ data: [], error: null }) }
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

      const result = await togglePersonStatus('person-1', 'inactive')

      expect(result.status).toBe('active')
    })
  })
})
