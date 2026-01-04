# Cadence V1 Backend - Quick Start

## 🎯 What You Need To Do

### 1. Install Supabase Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy Project URL and anon key

### 3. Run Database Schema
1. Open Supabase → SQL Editor
2. Copy/paste contents of `supabase/schema.sql`
3. Click Run

### 4. Set up Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com/) → Create OAuth Client
2. Add redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
3. Copy Client ID and Secret
4. Supabase → Authentication → Providers → Google
5. Paste Client ID and Secret

### 5. Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6. Test It!
```bash
npm run dev
```
Visit http://localhost:3000 → Should redirect to /login → Sign in with Google

---

## 📁 What's Been Created

### Backend Infrastructure
- ✅ **Database Schema** (`supabase/schema.sql`)
  - All V1 tables with RLS
  - Indexes and triggers
  - Cascade delete logic

- ✅ **Supabase Clients** (`lib/supabase/`)
  - Browser client
  - Server client
  - TypeScript types

- ✅ **Authentication**
  - Login page (`app/login/page.tsx`)
  - OAuth callback (`app/auth/callback/route.ts`)
  - Auth middleware (`middleware.ts`)
  - Auto-creates user profile on first login

### Documentation
- ✅ **BACKEND_SETUP.md** - Detailed setup steps
- ✅ **IMPLEMENTATION_GUIDE.md** - Full implementation guide
- ✅ **QUICK_START.md** - This file

---

## ⚡ Next Steps

1. **Complete setup** (Steps 1-6 above)
2. **Test authentication** works
3. **Replace mock data** domain by domain:
   - Teams first (simplest)
   - Then People
   - Then Tasks last
4. **Follow IMPLEMENTATION_GUIDE.md** for detailed instructions

---

## 🔥 Key Files

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Complete database schema - run this in Supabase SQL Editor |
| `lib/supabase/client.ts` | Browser Supabase client for client components |
| `lib/supabase/server.ts` | Server Supabase client for server components |
| `lib/supabase/types.ts` | TypeScript types for database tables |
| `middleware.ts` | Auth middleware - refreshes tokens & protects routes |
| `app/login/page.tsx` | Login page with Google OAuth button |
| `app/auth/callback/route.ts` | Handles OAuth redirect & creates user profile |

---

## 🛡️ V1 Scope (DO NOT EXCEED)

### ✅ In Scope
- Google OAuth only
- Teams CRUD
- People CRUD
- Tasks CRUD
- Team Memberships
- Task Relations (people/teams)
- User profile on first login

### ❌ Out of Scope
- Meetings
- Projects
- Delivery data
- Insights/dashboards
- Recurrences
- AI/automation
- Multi-user/orgs
- Password auth

---

## 🚨 Important Notes

1. **RLS is enabled** - Users can only see their own data
2. **owning_user_id** - Every record is tied to the user who created it
3. **Cascade deletes** - Handled by database triggers
4. **No passwords** - Google OAuth only
5. **First login** - User profile created automatically

---

## 📚 Full Documentation

- **Detailed Setup**: `BACKEND_SETUP.md`
- **Implementation Steps**: `IMPLEMENTATION_GUIDE.md`
- **V1 Requirements**: See main project instructions

---

## ✨ Success Criteria

V1 is complete when:
- [ ] User can sign in with Google
- [ ] Teams persist across sessions
- [ ] People persist across sessions
- [ ] Tasks persist across sessions
- [ ] Data survives logout/refresh
- [ ] No mock data remains

---

**Ready? Start with Step 1 above! 🚀**
