# Cadence V1 - Implementation Guide

## What You Have Now

I've created the complete backend infrastructure for Cadence V1. Here's what's been set up:

### 1. Database Schema (`supabase/schema.sql`)
- ✅ All V1 tables (user_profiles, teams, people, team_memberships, tasks, task_relations)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for updated_at timestamps
- ✅ Cascade delete logic for orphaned tasks

### 2. Supabase Client Configuration
- ✅ Browser client (`lib/supabase/client.ts`)
- ✅ Server client (`lib/supabase/server.ts`)
- ✅ TypeScript types (`lib/supabase/types.ts`)
- ✅ Auth middleware (`middleware.ts`)

### 3. Authentication
- ✅ Login page (`app/login/page.tsx`)
- ✅ Auth callback handler (`app/auth/callback/route.ts`)
- ✅ User profile auto-creation on first login
- ✅ Protected routes with middleware

### 4. Documentation
- ✅ Setup guide (`BACKEND_SETUP.md`)
- ✅ This implementation guide

---

## Next Steps - Follow in Order

### Step 1: Complete Backend Setup (Manual Steps Required)

**You must do these steps yourself:**

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Wait for initialization

2. **Run Database Schema**
   - Open Supabase SQL Editor
   - Copy contents of `supabase/schema.sql`
   - Run the query
   - Verify tables created in Table Editor

3. **Set up Google OAuth**
   - Follow instructions in `BACKEND_SETUP.md`
   - Get Google Client ID and Secret
   - Configure in Supabase Auth providers

4. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

5. **Create `.env.local`**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

6. **Test Authentication**
   ```bash
   npm run dev
   ```
   - Visit http://localhost:3000
   - Should redirect to /login
   - Click "Continue with Google"
   - Should auth and redirect to dashboard

---

### Step 2: Replace Mock Data - Teams (First Domain)

Create `lib/services/teams.ts`:

```typescript
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Team = Database['public']['Tables']['teams']['Row']
type TeamInsert = Database['public']['Tables']['teams']['Insert']
type TeamUpdate = Database['public']['Tables']['teams']['Update']

export async function getTeams() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createTeam(team: Omit<TeamInsert, 'owning_user_id'>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('teams')
    .insert({ ...team, owning_user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTeam(id: string, updates: TeamUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTeam(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', id)

  if (error) throw error
}
```

Then update `app/(dashboard)/teams/page.tsx` to use these functions instead of mock data.

---

### Step 3: Replace Mock Data - People

Create `lib/services/people.ts` following same pattern as teams.

Key differences:
- Link to teams via team_memberships table
- Handle team assignments when creating/updating

---

### Step 4: Replace Mock Data - Tasks

Create `lib/services/tasks.ts`.

Important:
- Create task_relations when linking to people/teams
- Handle cascade deletes through database triggers
- Query with joins to show related entities

---

### Step 5: Update UI Components

For each domain (teams, people, tasks):

1. **Replace useState with data fetching**
   ```typescript
   // Before
   const [teams, setTeams] = useState(mockTeams)

   // After
   const [teams, setTeams] = useState<Team[]>([])

   useEffect(() => {
     getTeams().then(setTeams).catch(console.error)
   }, [])
   ```

2. **Replace create/update/delete handlers**
   ```typescript
   // Before
   const handleCreate = (team) => {
     setTeams([...teams, { ...team, id: Date.now() }])
   }

   // After
   const handleCreate = async (team) => {
     const newTeam = await createTeam(team)
     setTeams([...teams, newTeam])
   }
   ```

3. **Add error handling**
   ```typescript
   try {
     await deleteTeam(id)
     setTeams(teams.filter(t => t.id !== id))
   } catch (error) {
     console.error('Failed to delete:', error)
     // Show error toast/message
   }
   ```

---

## Database Query Examples

### Get teams with member count
```typescript
const { data } = await supabase
  .from('teams')
  .select(`
    *,
    team_memberships(count)
  `)
```

### Get people with their teams
```typescript
const { data } = await supabase
  .from('people')
  .select(`
    *,
    team_memberships(
      teams(id, name)
    )
  `)
```

### Get tasks with related entities
```typescript
const { data } = await supabase
  .from('tasks')
  .select(`
    *,
    task_relations(
      entity_type,
      entity_id
    )
  `)
```

---

## Testing Checklist

After each domain replacement:

- [ ] Can create new records
- [ ] Can read/list records
- [ ] Can update records
- [ ] Can delete records
- [ ] Data persists after refresh
- [ ] RLS prevents access to other users' data
- [ ] Errors are handled gracefully

---

## Common Issues & Solutions

### Issue: "Failed to fetch"
**Solution**: Check that NEXT_PUBLIC_SUPABASE_URL is correct and includes https://

### Issue: "JWT expired" or "Invalid token"
**Solution**: Refresh the page. Middleware should refresh the token automatically.

### Issue: "Row Level Security" error
**Solution**: Verify you're authenticated. Check that owning_user_id matches auth.uid().

### Issue: Data not showing
**Solution**:
1. Check browser console for errors
2. Verify RLS policies in Supabase dashboard
3. Check that data exists in Table Editor

---

## Migration Strategy

**Do NOT replace everything at once.**

Follow this order:
1. Auth & User (already done)
2. Teams (simplest domain)
3. People (depends on teams)
4. Tasks (depends on people and teams)

For each domain:
1. Create service file
2. Test in isolation
3. Update one UI page
4. Test thoroughly
5. Move to next domain

---

## Performance Tips

1. **Use select() to limit columns**
   ```typescript
   .select('id, name, status')  // Only needed fields
   ```

2. **Add indexes for frequent queries**
   Already added in schema for common patterns

3. **Batch operations when possible**
   ```typescript
   const { data } = await supabase
     .from('teams')
     .insert([team1, team2, team3])
   ```

4. **Cache data in React state**
   Only refetch when needed (after mutations)

---

## Security Reminders

- ✅ Never expose service role key to client
- ✅ Always use RLS policies (already configured)
- ✅ Validate user input before database operations
- ✅ Use TypeScript types to prevent errors
- ✅ Handle errors without exposing sensitive info

---

## Need Help?

1. **Supabase Docs**: https://supabase.com/docs
2. **Check Supabase Logs**: Dashboard → Logs
3. **Test Queries**: Use SQL Editor to test queries directly
4. **RLS Debugger**: Dashboard → Database → Roles

---

## Success Criteria

V1 is complete when:
- ✅ User can sign in with Google
- ✅ Teams persist across sessions
- ✅ People persist across sessions
- ✅ Tasks persist across sessions
- ✅ Data survives logout and return
- ✅ Historical data remains intact
- ✅ No mock data remaining

---

## Files Created

```
supabase/
  └── schema.sql                    # Database schema

lib/
  └── supabase/
      ├── client.ts                 # Browser client
      ├── server.ts                 # Server client
      └── types.ts                  # TypeScript types

app/
  ├── login/
  │   └── page.tsx                  # Login page
  └── auth/
      └── callback/
          └── route.ts              # OAuth callback

middleware.ts                       # Auth middleware

BACKEND_SETUP.md                    # Setup instructions
IMPLEMENTATION_GUIDE.md             # This file
```

---

**Next**: Follow Step 1 to complete backend setup, then proceed with replacing mock data domain by domain.
