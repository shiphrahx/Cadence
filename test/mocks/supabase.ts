import { vi } from 'vitest'

/**
 * Mock Supabase client for testing
 * Provides chainable methods that match the Supabase API
 */
export function createMockSupabaseClient() {
  const mockData: any[] = []
  const mockError: any = null
  let mockUser: any = { id: 'test-user-id', email: 'test@example.com' }

  const createChainableMock = (returnData: any = mockData, returnError: any = mockError) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: returnData, error: returnError }),
    then: vi.fn((resolve) => resolve({ data: returnData, error: returnError })),
  })

  return {
    from: vi.fn(() => createChainableMock()),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: mockUser } }, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    // Helper to set mock data
    __setMockData: (data: any[]) => {
      mockData.length = 0
      mockData.push(...data)
    },
    // Helper to set mock user
    __setMockUser: (user: any) => {
      mockUser = user
    },
  }
}

/**
 * Mock for @supabase/supabase-js
 */
export const mockSupabaseClient = createMockSupabaseClient()

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabaseClient),
}))
