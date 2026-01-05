# Cadence - Project Documentation

## Project Overview

Cadence is a lightweight web platform for engineering managers to run their day-to-day work effectively. It serves as a control centre for management work, bringing together tasks, meetings, delivery data, and personal growth in one clear, organized place.

**Repository:** https://github.com/shiphrahx/Cadence
**Project Board:** https://github.com/users/shiphrahx/projects/2

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (using @tailwindcss/postcss)
- **UI Components:** shadcn/ui with Radix UI primitives
- **Icons:** Lucide React
- **Font:** Inter (Google Fonts)
- **Database:** Supabase Postgres with Row Level Security
- **Authentication:** Supabase Auth with Google OAuth
- **Testing:** Vitest with React Testing Library

## Design System

### Colors
- **Primary Color:** #AEA6FD (Jellyfish purple from icon_02.png)
- **Seniority Level Colors:**
  - Junior: Green (bg-green-100, text-green-700, border-green-300)
  - Mid: Yellow (bg-yellow-100, text-yellow-700, border-yellow-300)
  - Senior: Pink (bg-pink-100, text-pink-700, border-pink-300)
  - Custom: Blue (bg-blue-100, text-blue-700, border-blue-300)

### Logo
- **File:** public/icon_02.png
- **Size:** 35px × 35px
- **Style:** Rounded corners
- **Placement:** Top-left of sidebar, clickable and navigates to dashboard

### Design Philosophy
- Desktop-first responsive design
- Jellyfish-inspired UI aesthetics
- Clean, organized interface
- Color coding for visual scanning and quick identification

## Project Structure

```
Cadence/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   ├── page.tsx             # Dashboard homepage
│   │   ├── people/
│   │   │   └── page.tsx         # People management (CRUD complete)
│   │   ├── teams/
│   │   │   └── page.tsx         # Teams management (CRUD complete)
│   │   ├── tasks/
│   │   │   └── page.tsx         # Tasks management (CRUD complete)
│   │   └── ...
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts         # OAuth callback handler
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── globals.css              # Global styles with Tailwind imports
│   └── layout.tsx               # Root layout
├── components/
│   ├── sidebar.tsx              # Navigation sidebar component
│   ├── people-table.tsx         # People table component
│   ├── teams-table.tsx          # Teams table component
│   ├── tasks/
│   │   ├── task-card.tsx        # Task card component
│   │   ├── board-column.tsx     # Kanban board column
│   │   └── backlog-table.tsx    # Backlog table
│   ├── __tests__/               # Component tests
│   │   ├── people-table.test.tsx
│   │   └── teams-table.test.tsx
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── dialog.tsx
│       └── ...
├── lib/
│   ├── services/                # Service layer for data access
│   │   ├── people.ts
│   │   ├── teams.ts
│   │   ├── tasks.ts
│   │   └── __tests__/           # Service layer tests
│   │       ├── people.test.ts
│   │       ├── teams.test.ts
│   │       └── tasks.test.ts
│   ├── supabase/                # Supabase clients and types
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── types.ts             # Database types
│   ├── types/
│   │   └── task.ts              # Task type definitions
│   └── utils.ts                 # Utility functions
├── test/
│   ├── mocks/
│   │   └── supabase.ts          # Supabase mock for testing
│   ├── integration/
│   │   ├── setup.ts             # Integration test setup
│   │   └── teams.integration.test.ts
│   └── setup.ts                 # Test configuration
├── supabase/
│   └── schema.sql               # Database schema
├── proxy.ts                     # Authentication middleware
├── vitest.config.ts             # Vitest configuration
├── postcss.config.mjs           # PostCSS config for Tailwind v4
├── tailwind.config.ts           # Tailwind configuration
├── package.json
└── README.md
```

## Key Implementation Decisions

### 1. Tailwind CSS v4 Configuration
- Uses `@tailwindcss/postcss` plugin instead of regular `tailwindcss`
- Global CSS uses `@import "tailwindcss";` instead of `@tailwind` directives
- Custom primary color configured in tailwind.config.ts

### 2. Data Management
- **Backend:** Supabase Postgres with Row Level Security
- **Service Layer Pattern:** All database operations abstracted in `lib/services/`
- **Authentication:** Google OAuth via Supabase Auth
- **Session Management:** Cookie-based with server-side validation
- **Data Format Mapping:** Bidirectional mapping between database and UI formats (e.g., Tasks)
- **Date Format:** ISO 8601 in database, formatted for display in UI

### 3. People Management Features
- Full CRUD operations (Create, Read, Update, Delete)
- Quick-select buttons for seniority levels (Junior, Mid, Senior)
- Custom seniority level input option
- Color-coded badges in table for visual identification
- Dynamic statistics calculation (Total People, By Level, Recent Hires)
- Active/Inactive status toggle
- Delete confirmation requiring user to type person's name
- Clickable table rows to open edit dialog
- Default start date set to today for new entries
- Uses person's actual name in dialog titles for personalization

### 4. UI/UX Patterns
- **Button Hover:** Darker by default, lighter on hover (inverted from standard)
- **Cursor States:** Pointer cursor on all interactive elements
- **Form Management:** Controlled components with useEffect for state reset
- **Event Propagation:** Stopped on nested clickable elements (table rows + action buttons)
- **Dialog Pattern:** Reusable PersonFormDialog for both Add and Edit operations
- **Dropdown Menus:** Actions accessible via More (⋯) button with Edit, Toggle Status, Delete

### 5. Component Architecture
- **Reusability:** Form dialogs handle both add and edit modes
- **Type Safety:** TypeScript interfaces for all data structures
- **Client/Server Separation:** Supabase clients for browser vs server contexts
- **Testing:** Comprehensive unit, component, and integration tests

### 6. Testing Infrastructure
- **Unit Tests:** Service layer tests with mocked Supabase client
- **Component Tests:** React component tests with React Testing Library
- **Integration Tests:** End-to-end tests with real Supabase test instance
- **Test Coverage:** 91+ test cases across all domains
- **Scripts:**
  - `npm test` - Run tests in watch mode
  - `npm run test:run` - Run all tests once
  - `npm run test:ui` - Interactive test UI
  - `npm run test:coverage` - Generate coverage report

## Development Workflow

### Git Workflow
1. Always work on feature branches
2. Create descriptive branch names (e.g., `feature/seniority-quick-select`)
3. Commit messages should be concise and descriptive
4. **IMPORTANT:** Never mention Claude or AI tools in GitHub comments, PRs, or commit messages
5. Create PRs to master for review
6. Delete feature branches after merging

### Code Style
- Use TypeScript for all components
- Follow Next.js App Router conventions
- Prefer composition over duplication
- Use shadcn/ui components for consistency
- Implement proper TypeScript typing

## Implementation Status

### ✅ V1 Backend Complete
- [x] Supabase database integration
  - [x] Database schema with RLS policies
  - [x] Supabase clients (browser and server)
  - [x] Service layer for all domains
- [x] Google OAuth authentication
  - [x] Login page with OAuth flow
  - [x] Authentication middleware (proxy.ts)
  - [x] Session management with cookies
- [x] Teams management
  - [x] Full CRUD operations
  - [x] Member count aggregation
  - [x] Status toggle
- [x] People management
  - [x] Full CRUD operations
  - [x] Team memberships with JOIN queries
  - [x] Color-coded seniority badges
  - [x] Status toggle
- [x] Tasks management
  - [x] Full CRUD operations
  - [x] Kanban board with drag-and-drop
  - [x] Database-UI format mapping
  - [x] Week/Backlog organization
- [x] Testing infrastructure
  - [x] Unit tests for all services (33 tests)
  - [x] Component tests (43 tests)
  - [x] Integration test setup (15 tests)
  - [x] Vitest configuration
  - [x] Supabase mocks

### 🚧 In Progress / Planned
- [ ] Projects management
- [ ] Meetings management
- [ ] Career Goals tracking
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Additional integration tests for People and Tasks
- [ ] E2E tests with Playwright

## Key Files Reference

### Service Layer
- **lib/services/teams.ts** - Teams CRUD operations with member count aggregation
- **lib/services/people.ts** - People CRUD with team membership JOINs
- **lib/services/tasks.ts** - Tasks CRUD with database-UI format mapping

### Supabase Integration
- **lib/supabase/client.ts** - Browser-side Supabase client
- **lib/supabase/server.ts** - Server-side Supabase client
- **lib/supabase/types.ts** - Database type definitions
- **supabase/schema.sql** - Complete database schema with RLS policies

### Authentication
- **proxy.ts** - Authentication middleware for Next.js 16
- **app/login/page.tsx** - Login page with Google OAuth
- **app/auth/callback/route.ts** - OAuth callback handler

### Testing
- **test/setup.ts** - Global test configuration
- **test/mocks/supabase.ts** - Supabase client mock for unit tests
- **test/integration/setup.ts** - Integration test helpers and cleanup
- **vitest.config.ts** - Vitest configuration with React plugin

## Data Models

### Teams
```typescript
interface Team {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive'
  memberCount: number
  createdAt: string
  notes?: string
}
```

### People
```typescript
interface Person {
  id: string
  name: string
  role: string | null
  level: string | null
  startDate: string | null
  status: 'active' | 'inactive'
  teams: string[]
  notes?: string | null
  createdAt: string
}
```

### Tasks
```typescript
interface Task {
  id: string
  title: string
  description?: string
  dueDate: string | null
  priority: 'Low' | 'Medium' | 'High' | 'Very High'
  category: 'Task' | 'Meeting'
  status: 'Not started' | 'In progress' | 'Blocked' | 'Done'
  list: 'week' | 'backlog'
}
```

## Important Notes

### For Development
1. **Never mention Claude/AI** in any GitHub-related content
2. **Read files before editing** - Always use Read tool before making changes
3. **Use specialized tools** - Prefer Read/Edit/Write over bash commands for file operations
4. **Parallel tool calls** - Make independent tool calls in parallel when possible
5. **Service Layer Pattern** - All database operations go through `lib/services/` layer
6. **Authentication Required** - All protected routes require Supabase auth via proxy.ts

### Environment Setup
1. Copy `.env.example` to `.env.local` (if exists) or create `.env.local`
2. Add Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Set up Google OAuth in Supabase dashboard
4. Run `npm install` to install dependencies
5. Run `npm run dev` to start development server

### Testing
1. **Run tests**: `npm run test:run`
2. **Watch mode**: `npm test`
3. **Coverage**: `npm run test:coverage`
4. **Integration tests**: Run separately with `npm run test -- test/integration`

### For Future Enhancements
1. Build out remaining menu sections (Projects, Meetings, Career Goals)
2. Add team assignment functionality to People page
3. Implement data export/import functionality
4. Add CI/CD pipeline with GitHub Actions
5. Complete integration tests for People and Tasks domains
6. Add E2E tests with Playwright

## Related Documentation
- Requirements: See GitHub Project Board
- Design Reference: Jellyfish-inspired aesthetics with purple primary color
- Issues: Track via GitHub Issues (linked to Project Board)

---

Last Updated: 2026-01-04

## Changelog

### 2026-01-04 - V1 Backend Complete
- Implemented Supabase database integration with RLS policies
- Added Google OAuth authentication
- Migrated Teams, People, and Tasks to use Supabase backend
- Created comprehensive testing infrastructure (91+ tests)
- Updated documentation to reflect current architecture

### 2025-12-18 - Initial Setup
- Project initialization with Next.js 16 and Tailwind CSS v4
- Basic UI components and navigation
- Mock data implementation for People management
