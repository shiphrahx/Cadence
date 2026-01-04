# Cadence Backend V1 - Setup Guide

## Overview
This guide walks you through setting up the Supabase backend for Cadence V1.

## Prerequisites
- Supabase account (free tier is fine)
- Google Cloud Console account (for OAuth)
- Node.js installed

---

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project:
   - **Project name**: `cadence`
   - **Database password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to you
   - **Pricing plan**: Free

5. Wait for project to initialize (~2 minutes)

---

## Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click "Run" or press Cmd/Ctrl + Enter
6. Verify success - you should see "Success. No rows returned"

### Verify Tables Created
Go to **Table Editor** and confirm you see:
- user_profiles
- teams
- people
- team_memberships
- tasks
- task_relations

---

## Step 3: Configure Google OAuth

### A. Set up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen (if first time):
   - User Type: **External**
   - App name: `Cadence`
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `email` and `profile`
   - Save and continue

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `Cadence Production`
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production URL (when deployed)
   - Authorized redirect URIs:
     - `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
     - Replace `YOUR-PROJECT-REF` with your Supabase project ref
     - Find this in Supabase: **Authentication** → **Providers** → **Google**

7. Click **Create**
8. **Save** the Client ID and Client Secret

### B. Configure Supabase Auth

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Enable Google provider
4. Paste:
   - **Client ID**: from Google Cloud Console
   - **Client Secret**: from Google Cloud Console
5. Click **Save**

---

## Step 4: Get Supabase Credentials

In your Supabase dashboard:

1. Go to **Project Settings** (gear icon)
2. Go to **API** section
3. Copy these values:
   - **Project URL**: `https://YOUR-PROJECT-REF.supabase.co`
   - **anon public key**: Long JWT token starting with `eyJ...`

---

## Step 5: Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

---

## Step 6: Configure Environment Variables

Create `.env.local` in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**IMPORTANT**: Replace the placeholder values with your actual Supabase credentials.

Add to `.gitignore`:
```
.env.local
.env*.local
```

---

## Step 7: Create Supabase Client

The implementation files will be created in the next step.

Files to create:
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client
- `lib/supabase/middleware.ts` - Auth middleware

---

## Step 8: Test Database Connection

After setting up the client files, test the connection:

1. Start your dev server: `npm run dev`
2. Open browser console
3. You should see no Supabase errors
4. Try signing in with Google

---

## Step 9: Verify RLS Policies

1. In Supabase dashboard, go to **Authentication** → **Policies**
2. Verify each table has RLS enabled
3. Verify policies are created for each table
4. Test by trying to query data before/after authentication

---

## Troubleshooting

### Google OAuth not working
- Check redirect URI matches exactly (including https)
- Verify Google OAuth consent screen is published
- Check browser console for errors

### RLS blocking queries
- Verify you're authenticated (check `auth.users` table)
- Check `owning_user_id` matches `auth.uid()`
- Review policy definitions in SQL editor

### Database connection errors
- Verify environment variables are correct
- Check Project URL includes `https://`
- Ensure anon key is the public key, not service role key

---

## Next Steps

After completing setup:
1. Implement authentication flow
2. Create user profile on first login
3. Replace mock data with Supabase queries
4. Test CRUD operations for each entity

---

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Policies tested for each table
- [ ] `.env.local` added to `.gitignore`
- [ ] Service role key (if used) never exposed to client
- [ ] Google OAuth redirect URIs match exactly
- [ ] Only necessary scopes requested (email, profile)

---

## Useful Supabase Dashboard Links

- **Table Editor**: View and edit data
- **SQL Editor**: Run custom queries
- **Authentication**: Manage users and auth settings
- **Database** → **Roles**: View RLS policies
- **Logs**: Debug queries and auth issues
