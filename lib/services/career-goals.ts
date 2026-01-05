import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export interface CareerGoalsProfile {
  id: string
  whereYouAre: string
  whereYouWantToGo: string
  createdAt: string
  updatedAt: string
}

export interface GapAnalysisCategory {
  id: string
  category: string
  currentState: string
  desiredState: string
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface FocusDistribution {
  id: string
  timePeriod: 'short_term' | 'mid_term' | 'long_term'
  categoryId: string
  category: string // Denormalized for easier use
  focusPercent: number
  why: string
  createdAt: string
  updatedAt: string
}

export interface CareerGoal {
  id: string
  timePeriod: 'short_term' | 'mid_term' | 'long_term'
  goal: string
  type: 'Core' | 'Stretch'
  categoryId: string
  category: string // Denormalized for easier use
  status: 'Not started' | 'In progress' | 'Completed'
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface Achievement {
  id: string
  type: 'Book' | 'Course' | 'Certification' | 'Conference' | 'Talk' | 'Other'
  description: string
  achievementDate: string
  keyTakeaway: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// CAREER GOALS PROFILE
// ============================================================================

export async function getCareerGoalsProfile(): Promise<CareerGoalsProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('career_goals_profiles')
    .select('*')
    .single()

  if (error) {
    // If no profile exists yet, return null
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  if (!data) return null

  return {
    id: (data as any).id,
    whereYouAre: (data as any).where_you_are || '',
    whereYouWantToGo: (data as any).where_you_want_to_go || '',
    createdAt: (data as any).created_at,
    updatedAt: (data as any).updated_at,
  }
}

export async function upsertCareerGoalsProfile(
  profile: Partial<CareerGoalsProfile>
): Promise<CareerGoalsProfile> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('career_goals_profiles')
    .upsert({
      where_you_are: profile.whereYouAre,
      where_you_want_to_go: profile.whereYouWantToGo,
      owning_user_id: user.id,
    } as any)
    .select()
    .single()

  if (error) throw error

  return {
    id: (data as any).id,
    whereYouAre: (data as any).where_you_are || '',
    whereYouWantToGo: (data as any).where_you_want_to_go || '',
    createdAt: (data as any).created_at,
    updatedAt: (data as any).updated_at,
  }
}

// ============================================================================
// GAP ANALYSIS CATEGORIES
// ============================================================================

export async function getGapAnalysisCategories(): Promise<GapAnalysisCategory[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('gap_analysis_categories')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data as any).map((category: any) => ({
    id: category.id,
    category: category.category,
    currentState: category.current_state || '',
    desiredState: category.desired_state || '',
    displayOrder: category.display_order || 0,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
  }))
}

export async function createGapAnalysisCategory(
  category: Omit<GapAnalysisCategory, 'id' | 'createdAt' | 'updatedAt'>
): Promise<GapAnalysisCategory> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('gap_analysis_categories')
    .insert({
      category: category.category,
      current_state: category.currentState,
      desired_state: category.desiredState,
      display_order: category.displayOrder,
      owning_user_id: user.id,
    } as any)
    .select()
    .single()

  if (error) throw error

  return {
    id: (data as any).id,
    category: (data as any).category,
    currentState: (data as any).current_state || '',
    desiredState: (data as any).desired_state || '',
    displayOrder: (data as any).display_order || 0,
    createdAt: (data as any).created_at,
    updatedAt: (data as any).updated_at,
  }
}

export async function updateGapAnalysisCategory(
  id: string,
  updates: Partial<GapAnalysisCategory>
): Promise<GapAnalysisCategory> {
  const supabase = createClient()

  const dbUpdates: any = {}
  if (updates.category !== undefined) dbUpdates.category = updates.category
  if (updates.currentState !== undefined) dbUpdates.current_state = updates.currentState
  if (updates.desiredState !== undefined) dbUpdates.desired_state = updates.desiredState
  if (updates.displayOrder !== undefined) dbUpdates.display_order = updates.displayOrder

  const { data, error } = await (supabase
    .from('gap_analysis_categories') as any)
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return {
    id: (data as any).id,
    category: (data as any).category,
    currentState: (data as any).current_state || '',
    desiredState: (data as any).desired_state || '',
    displayOrder: (data as any).display_order || 0,
    createdAt: (data as any).created_at,
    updatedAt: (data as any).updated_at,
  }
}

export async function deleteGapAnalysisCategory(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('gap_analysis_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================================================
// FOCUS DISTRIBUTIONS
// ============================================================================

export async function getFocusDistributions(
  timePeriod: 'short_term' | 'mid_term' | 'long_term'
): Promise<FocusDistribution[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('focus_distributions')
    .select(`
      *,
      gap_analysis_categories!inner(category)
    `)
    .eq('time_period', timePeriod)

  if (error) throw error

  return (data as any).map((dist: any) => ({
    id: dist.id,
    timePeriod: dist.time_period,
    categoryId: dist.category_id,
    category: dist.gap_analysis_categories?.category || '',
    focusPercent: dist.focus_percent || 0,
    why: dist.why || '',
    createdAt: dist.created_at,
    updatedAt: dist.updated_at,
  }))
}

export async function upsertFocusDistribution(
  distribution: Omit<FocusDistribution, 'id' | 'category' | 'createdAt' | 'updatedAt'>
): Promise<FocusDistribution> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('focus_distributions')
    .upsert({
      time_period: distribution.timePeriod,
      category_id: distribution.categoryId,
      focus_percent: distribution.focusPercent,
      why: distribution.why,
      owning_user_id: user.id,
    } as any, {
      onConflict: 'category_id,time_period'
    })
    .select(`
      *,
      gap_analysis_categories!inner(category)
    `)
    .single()

  if (error) throw error

  return {
    id: (data as any).id,
    timePeriod: (data as any).time_period,
    categoryId: (data as any).category_id,
    category: (data as any).gap_analysis_categories?.category || '',
    focusPercent: (data as any).focus_percent || 0,
    why: (data as any).why || '',
    createdAt: (data as any).created_at,
    updatedAt: (data as any).updated_at,
  }
}

// ============================================================================
// CAREER GOALS
// ============================================================================

export async function getCareerGoals(
  timePeriod: 'short_term' | 'mid_term' | 'long_term'
): Promise<CareerGoal[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('career_goals')
    .select(`
      *,
      gap_analysis_categories!inner(category)
    `)
    .eq('time_period', timePeriod)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data as any).map((goal: any) => ({
    id: goal.id,
    timePeriod: goal.time_period,
    goal: goal.goal,
    type: goal.type,
    categoryId: goal.category_id,
    category: goal.gap_analysis_categories?.category || '',
    status: goal.status,
    displayOrder: goal.display_order || 0,
    createdAt: goal.created_at,
    updatedAt: goal.updated_at,
  }))
}

export async function createCareerGoal(
  goal: Omit<CareerGoal, 'id' | 'category' | 'createdAt' | 'updatedAt'>
): Promise<CareerGoal> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('career_goals')
    .insert({
      time_period: goal.timePeriod,
      goal: goal.goal,
      type: goal.type,
      category_id: goal.categoryId,
      status: goal.status,
      display_order: goal.displayOrder,
      owning_user_id: user.id,
    } as any)
    .select(`
      *,
      gap_analysis_categories!inner(category)
    `)
    .single()

  if (error) throw error

  return {
    id: (data as any).id,
    timePeriod: (data as any).time_period,
    goal: (data as any).goal,
    type: (data as any).type,
    categoryId: (data as any).category_id,
    category: (data as any).gap_analysis_categories?.category || '',
    status: (data as any).status,
    displayOrder: (data as any).display_order || 0,
    createdAt: (data as any).created_at,
    updatedAt: (data as any).updated_at,
  }
}

export async function updateCareerGoal(
  id: string,
  updates: Partial<CareerGoal>
): Promise<CareerGoal> {
  const supabase = createClient()

  const dbUpdates: any = {}
  if (updates.goal !== undefined) dbUpdates.goal = updates.goal
  if (updates.type !== undefined) dbUpdates.type = updates.type
  if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId
  if (updates.status !== undefined) dbUpdates.status = updates.status
  if (updates.displayOrder !== undefined) dbUpdates.display_order = updates.displayOrder

  const { data, error } = await (supabase
    .from('career_goals') as any)
    .update(dbUpdates)
    .eq('id', id)
    .select(`
      *,
      gap_analysis_categories!inner(category)
    `)
    .single()

  if (error) throw error

  return {
    id: (data as any).id,
    timePeriod: (data as any).time_period,
    goal: (data as any).goal,
    type: (data as any).type,
    categoryId: (data as any).category_id,
    category: (data as any).gap_analysis_categories?.category || '',
    status: (data as any).status,
    displayOrder: (data as any).display_order || 0,
    createdAt: (data as any).created_at,
    updatedAt: (data as any).updated_at,
  }
}

export async function deleteCareerGoal(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('career_goals')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

export async function getAchievements(): Promise<Achievement[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('achievement_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data as any).map((achievement: any) => ({
    id: achievement.id,
    type: achievement.type,
    description: achievement.description,
    achievementDate: achievement.achievement_date,
    keyTakeaway: achievement.key_takeaway || '',
    createdAt: achievement.created_at,
    updatedAt: achievement.updated_at,
  }))
}

export async function createAchievement(
  achievement: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Achievement> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('achievements')
    .insert({
      type: achievement.type,
      description: achievement.description,
      achievement_date: achievement.achievementDate,
      key_takeaway: achievement.keyTakeaway,
      owning_user_id: user.id,
    } as any)
    .select()
    .single()

  if (error) throw error

  return {
    id: (data as any).id,
    type: (data as any).type,
    description: (data as any).description,
    achievementDate: (data as any).achievement_date,
    keyTakeaway: (data as any).key_takeaway || '',
    createdAt: (data as any).created_at,
    updatedAt: (data as any).updated_at,
  }
}

export async function updateAchievement(
  id: string,
  updates: Partial<Achievement>
): Promise<Achievement> {
  const supabase = createClient()

  const dbUpdates: any = {}
  if (updates.type !== undefined) dbUpdates.type = updates.type
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.achievementDate !== undefined) dbUpdates.achievement_date = updates.achievementDate
  if (updates.keyTakeaway !== undefined) dbUpdates.key_takeaway = updates.keyTakeaway

  const { data, error } = await (supabase
    .from('achievements') as any)
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return {
    id: (data as any).id,
    type: (data as any).type,
    description: (data as any).description,
    achievementDate: (data as any).achievement_date,
    keyTakeaway: (data as any).key_takeaway || '',
    createdAt: (data as any).created_at,
    updatedAt: (data as any).updated_at,
  }
}

export async function deleteAchievement(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('achievements')
    .delete()
    .eq('id', id)

  if (error) throw error
}
