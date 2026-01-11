import '@testing-library/jest-dom/vitest'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Import mocks to ensure they're registered before tests run
import './mocks/supabase'
