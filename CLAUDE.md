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
- **Database (Planned):** Supabase Postgres with Row Level Security
- **Authentication (Planned):** Supabase Auth with Google OAuth

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
│   │   │   └── page.tsx         # Teams page (placeholder)
│   │   └── ...
│   ├── globals.css              # Global styles with Tailwind imports
│   └── layout.tsx               # Root layout
├── components/
│   ├── sidebar.tsx              # Navigation sidebar component
│   ├── person-form-dialog.tsx   # Reusable person add/edit form
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── table.tsx
│       ├── badge.tsx
│       └── ...
├── lib/
│   └── utils.ts                 # Utility functions (cn helper)
├── public/
│   ├── banner_01.png            # Project banner
│   └── icon_02.png              # Logo/icon
├── .claude/
│   └── settings.local.json      # Local settings
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

### 2. Data Management (Current State)
- **V1 Approach:** Mock data with React state management
- **Persistence:** None (data resets on page refresh)
- **Future:** Supabase integration planned for later phases
- **Date Format:** DD-MM-YYYY for display
- **Data Retention:** 5 years active, 2 years inactive (planned)

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
- **Reusability:** PersonFormDialog handles both add and edit modes
- **Type Safety:** TypeScript interfaces for all data structures
- **Helper Functions:**
  - `getInitials()` - Generate avatar initials from names
  - `getLevelBadgeClass()` - Determine color class based on seniority level
  - `getLevelCounts()` - Calculate distribution by seniority
  - `getRecentHires()` - Count hires in last 30 days
  - `getTodayDate()` - Format today's date for date inputs

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

### ✅ Completed
- [x] Project initialization with Next.js 16
- [x] Tailwind CSS v4 setup
- [x] Sidebar navigation with all menu items
- [x] Dashboard homepage with weekly overview
- [x] People management page (Issue #5)
  - [x] Full CRUD operations
  - [x] Quick-select seniority buttons
  - [x] Color-coded seniority badges
  - [x] Active/Inactive status toggle
  - [x] Delete confirmation with name typing
  - [x] Dynamic statistics
  - [x] Clickable table rows
  - [x] Personalized dialog titles
- [x] Logo integration and sizing
- [x] Button hover state inversion
- [x] Pointer cursors on interactive elements

### 🚧 In Progress / Planned
- [ ] Teams management (Issue #6)
- [ ] Projects management
- [ ] Meetings management
- [ ] Career Goals tracking
- [ ] Tasks management
- [ ] Supabase database integration
- [ ] Google OAuth authentication
- [ ] Row Level Security implementation
- [ ] Data persistence
- [ ] Additional CRUD features for other entities

## Key Files Reference

### Core Components

**components/sidebar.tsx**
- Navigation sidebar with logo and menu items
- Logo clickable to dashboard (/)
- Hover effects on menu items and logo area

**components/person-form-dialog.tsx**
- Reusable dialog for add/edit person
- Quick-select seniority buttons with color coding
- Form validation and state management
- Uses person's name in edit mode title

**app/(dashboard)/people/page.tsx**
- People management with full CRUD
- Dynamic stats calculation
- Color-coded seniority badges
- Delete confirmation pattern
- Active/Inactive filtering

### UI Components (shadcn/ui)

**components/ui/button.tsx**
- Inverted hover states (darker default, lighter hover)
- Pointer cursor on all buttons
- Variants: default, destructive, outline, secondary, ghost, link

**components/ui/dialog.tsx**
- Modal dialog component
- White background, border styling
- Close button with pointer cursor

**components/ui/input.tsx**
- Form input with focus states
- Primary color focus ring (#AEA6FD)

**components/ui/table.tsx**
- Table components with hover states
- Used for data display in People page

## Data Models

### Person Interface
```typescript
interface Person {
  id?: number
  name: string
  role: string
  level: string          // Junior, Mid, Senior, or custom
  startDate: string      // YYYY-MM-DD format
  status: "active" | "inactive"
  teams: string[]
  notes?: string
}
```

## Important Notes

### For Development
1. **Never mention Claude/AI** in any GitHub-related content
2. **Read files before editing** - Always use Read tool before making changes
3. **Use specialized tools** - Prefer Read/Edit/Write over bash commands for file operations
4. **Parallel tool calls** - Make independent tool calls in parallel when possible
5. **Mock data only** - Current implementation uses mock data, no database yet

### For Future Enhancements
1. Implement localStorage for temporary persistence before Supabase
2. Add team assignment functionality to People page
3. Build out remaining menu sections (Teams, Projects, Meetings, Career Goals)
4. Integrate Supabase for authentication and data persistence
5. Implement Row Level Security policies
6. Add data export/import functionality

## Related Documentation
- Requirements: See GitHub Project Board
- Design Reference: Jellyfish-inspired aesthetics with purple primary color
- Issues: Track via GitHub Issues (linked to Project Board)

---

Last Updated: 2025-12-18
