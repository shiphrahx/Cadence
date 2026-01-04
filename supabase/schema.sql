-- Cadence V1 Database Schema
-- Execute this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER PROFILE TABLE
-- ============================================================================
-- Extends Supabase auth.users with application-specific profile data
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- TEAMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  owning_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- PEOPLE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  role TEXT,
  level TEXT,
  start_date DATE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  owning_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- TEAM MEMBERSHIP TABLE (Many-to-Many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.team_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  join_date DATE DEFAULT CURRENT_DATE NOT NULL,
  leave_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Prevent duplicate active memberships
  UNIQUE(team_id, person_id, leave_date)
);

-- ============================================================================
-- TASKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed')),
  due_date DATE,
  completion_date DATE,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'meeting_action', 'recurring_meeting', 'growth', 'performance')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'very_high')),
  owning_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- TASK RELATIONS TABLE (Polymorphic Links)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.task_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('person', 'team')),
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Prevent duplicate relations
  UNIQUE(task_id, entity_type, entity_id)
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_teams_owning_user ON public.teams(owning_user_id);
CREATE INDEX IF NOT EXISTS idx_teams_status ON public.teams(status);
CREATE INDEX IF NOT EXISTS idx_people_owning_user ON public.people(owning_user_id);
CREATE INDEX IF NOT EXISTS idx_people_status ON public.people(status);
CREATE INDEX IF NOT EXISTS idx_team_memberships_team ON public.team_memberships(team_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_person ON public.team_memberships(person_id);
CREATE INDEX IF NOT EXISTS idx_tasks_owning_user ON public.tasks(owning_user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_task_relations_task ON public.task_relations(task_id);
CREATE INDEX IF NOT EXISTS idx_task_relations_entity ON public.task_relations(entity_type, entity_id);

-- ============================================================================
-- TRIGGERS for updated_at timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_relations ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can only read/write their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Teams: Users can only access their own teams
CREATE POLICY "Users can view own teams" ON public.teams
  FOR SELECT USING (auth.uid() = owning_user_id);

CREATE POLICY "Users can insert own teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = owning_user_id);

CREATE POLICY "Users can update own teams" ON public.teams
  FOR UPDATE USING (auth.uid() = owning_user_id);

CREATE POLICY "Users can delete own teams" ON public.teams
  FOR DELETE USING (auth.uid() = owning_user_id);

-- People: Users can only access their own people
CREATE POLICY "Users can view own people" ON public.people
  FOR SELECT USING (auth.uid() = owning_user_id);

CREATE POLICY "Users can insert own people" ON public.people
  FOR INSERT WITH CHECK (auth.uid() = owning_user_id);

CREATE POLICY "Users can update own people" ON public.people
  FOR UPDATE USING (auth.uid() = owning_user_id);

CREATE POLICY "Users can delete own people" ON public.people
  FOR DELETE USING (auth.uid() = owning_user_id);

-- Team Memberships: Users can access memberships for their teams/people
CREATE POLICY "Users can view own team memberships" ON public.team_memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owning_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own team memberships" ON public.team_memberships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owning_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own team memberships" ON public.team_memberships
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owning_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own team memberships" ON public.team_memberships
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owning_user_id = auth.uid()
    )
  );

-- Tasks: Users can only access their own tasks
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = owning_user_id);

CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = owning_user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = owning_user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = owning_user_id);

-- Task Relations: Users can access relations for their tasks
CREATE POLICY "Users can view own task relations" ON public.task_relations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.owning_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own task relations" ON public.task_relations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.owning_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own task relations" ON public.task_relations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.owning_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own task relations" ON public.task_relations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.owning_user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTION: Cascade delete tasks when entity is deleted
-- ============================================================================
CREATE OR REPLACE FUNCTION delete_orphaned_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete tasks that only have relations to this entity
  DELETE FROM public.tasks
  WHERE id IN (
    SELECT task_id
    FROM public.task_relations
    WHERE entity_type = TG_ARGV[0]
    AND entity_id = OLD.id
    GROUP BY task_id
    HAVING COUNT(*) = 1
  );

  -- Remove relations for tasks linked to multiple entities
  DELETE FROM public.task_relations
  WHERE entity_type = TG_ARGV[0]
  AND entity_id = OLD.id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for cascading task deletion
CREATE TRIGGER cascade_delete_person_tasks
  BEFORE DELETE ON public.people
  FOR EACH ROW
  EXECUTE FUNCTION delete_orphaned_tasks('person');

CREATE TRIGGER cascade_delete_team_tasks
  BEFORE DELETE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION delete_orphaned_tasks('team');

-- ============================================================================
-- SEED DATA (Optional - for development)
-- ============================================================================
-- Uncomment to add sample data after first user logs in
-- Replace 'your-user-id' with actual auth.uid()

/*
-- Sample Team
INSERT INTO public.teams (name, description, status, owning_user_id)
VALUES ('Platform Engineering', 'Core infrastructure team', 'active', 'your-user-id');

-- Sample Person
INSERT INTO public.people (full_name, role, level, start_date, status, owning_user_id)
VALUES ('Sarah Miller', 'Senior Engineer', 'Senior', '2024-01-15', 'active', 'your-user-id');

-- Sample Task
INSERT INTO public.tasks (title, description, status, priority, due_date, owning_user_id)
VALUES ('Review Q1 Performance', 'Complete quarterly reviews', 'open', 'high', '2025-01-15', 'your-user-id');
*/
