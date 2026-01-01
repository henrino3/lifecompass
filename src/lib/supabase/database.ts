import { getSupabase } from './client';
import type { Reflection, JourneyResponse, Achievement, UserProfile, ReflectionPeriod, Mode } from '../types';

// Database types matching Supabase schema
interface DbReflection {
  id: string;
  user_id: string;
  year: number;
  period: string;
  period_label: string | null;
  mode: string;
  progress: number;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
  upgraded_from: string | null;
  created_at: string;
  updated_at: string;
}

interface DbResponse {
  id: string;
  reflection_id: string;
  question_id: string;
  value: unknown;
  created_at: string;
  updated_at: string;
}

interface DbAchievement {
  id: string;
  user_id: string;
  type: string;
  unlocked_at: string;
}

interface DbProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  theme: string;
  created_at: string;
  updated_at: string;
}

// Convert database reflection to app Reflection type
function dbToReflection(db: DbReflection, responses: Record<string, JourneyResponse> = {}): Reflection {
  return {
    id: db.id,
    userId: db.user_id,
    year: db.year,
    period: db.period as ReflectionPeriod,
    periodLabel: db.period_label || undefined,
    mode: db.mode as Mode,
    responses,
    progress: db.progress,
    completed: db.completed,
    startedAt: new Date(db.started_at),
    completedAt: db.completed_at ? new Date(db.completed_at) : undefined,
    upgradedFrom: db.upgraded_from || undefined,
    syncedAt: new Date(db.updated_at),
    localOnly: false,
  };
}

// Convert database profile to app UserProfile type
function dbToProfile(db: DbProfile): UserProfile {
  return {
    id: db.id,
    email: db.email || undefined,
    fullName: db.full_name || undefined,
    avatarUrl: db.avatar_url || undefined,
    theme: db.theme as UserProfile['theme'],
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

// ============ Profile Operations ============

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return dbToProfile(data as DbProfile);
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: updates.fullName,
      theme: updates.theme,
      avatar_url: updates.avatarUrl,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error || !data) return null;
  return dbToProfile(data as DbProfile);
}

// ============ Reflection Operations ============

export async function getReflections(userId: string): Promise<Reflection[]> {
  const supabase = getSupabase();

  // Get all reflections for user
  const { data: reflections, error } = await supabase
    .from('reflections')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('created_at', { ascending: false });

  if (error || !reflections) return [];

  // Get all responses for these reflections
  const reflectionIds = reflections.map((r: DbReflection) => r.id);
  const { data: responses } = await supabase
    .from('responses')
    .select('*')
    .in('reflection_id', reflectionIds);

  // Group responses by reflection
  const responsesByReflection: Record<string, Record<string, JourneyResponse>> = {};
  (responses || []).forEach((r: DbResponse) => {
    if (!responsesByReflection[r.reflection_id]) {
      responsesByReflection[r.reflection_id] = {};
    }
    responsesByReflection[r.reflection_id][r.question_id] = {
      questionId: r.question_id,
      value: r.value as JourneyResponse['value'],
      updatedAt: new Date(r.updated_at),
    };
  });

  return reflections.map((r: DbReflection) => dbToReflection(r, responsesByReflection[r.id] || {}));
}

export async function getReflection(reflectionId: string): Promise<Reflection | null> {
  const supabase = getSupabase();

  const { data: reflection, error } = await supabase
    .from('reflections')
    .select('*')
    .eq('id', reflectionId)
    .single();

  if (error || !reflection) return null;

  // Get responses
  const { data: responses } = await supabase
    .from('responses')
    .select('*')
    .eq('reflection_id', reflectionId);

  const responseMap: Record<string, JourneyResponse> = {};
  (responses || []).forEach((r: DbResponse) => {
    responseMap[r.question_id] = {
      questionId: r.question_id,
      value: r.value as JourneyResponse['value'],
      updatedAt: new Date(r.updated_at),
    };
  });

  return dbToReflection(reflection as DbReflection, responseMap);
}

export async function createReflection(
  userId: string,
  year: number,
  period: ReflectionPeriod,
  mode: Mode,
  upgradedFrom?: string
): Promise<Reflection | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('reflections')
    .insert({
      user_id: userId,
      year,
      period,
      mode,
      progress: 0,
      completed: false,
      upgraded_from: upgradedFrom || null,
    })
    .select()
    .single();

  if (error || !data) return null;
  return dbToReflection(data as DbReflection, {});
}

export async function updateReflection(
  reflectionId: string,
  updates: Partial<Pick<Reflection, 'progress' | 'completed' | 'completedAt' | 'mode'>>
): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('reflections')
    .update({
      progress: updates.progress,
      completed: updates.completed,
      completed_at: updates.completedAt?.toISOString(),
      mode: updates.mode,
    })
    .eq('id', reflectionId);

  return !error;
}

export async function deleteReflection(reflectionId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('reflections')
    .delete()
    .eq('id', reflectionId);
  return !error;
}

// ============ Response Operations ============

export async function saveResponse(
  reflectionId: string,
  questionId: string,
  value: JourneyResponse['value']
): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('responses')
    .upsert({
      reflection_id: reflectionId,
      question_id: questionId,
      value,
    }, {
      onConflict: 'reflection_id,question_id',
    });

  return !error;
}

export async function saveResponses(
  reflectionId: string,
  responses: Record<string, JourneyResponse>
): Promise<boolean> {
  const supabase = getSupabase();

  const rows = Object.entries(responses).map(([questionId, response]) => ({
    reflection_id: reflectionId,
    question_id: questionId,
    value: response.value,
  }));

  if (rows.length === 0) return true;

  const { error } = await supabase
    .from('responses')
    .upsert(rows, {
      onConflict: 'reflection_id,question_id',
    });

  return !error;
}

// ============ Achievement Operations ============

export async function getAchievements(userId: string): Promise<Achievement[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId);

  if (error || !data) return [];

  return data.map((a: DbAchievement) => ({
    id: a.id,
    type: a.type as Achievement['type'],
    name: '', // Will be filled from ACHIEVEMENTS constant
    description: '',
    icon: '',
    unlockedAt: new Date(a.unlocked_at),
  }));
}

export async function unlockAchievement(userId: string, type: string): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('achievements')
    .insert({
      user_id: userId,
      type,
    });

  // Ignore duplicate errors (achievement already unlocked)
  return !error || error.code === '23505';
}

// ============ Migration Helpers ============

export async function migrateLocalReflections(
  userId: string,
  localReflections: Reflection[]
): Promise<{ success: boolean; migrated: number }> {
  let migrated = 0;

  for (const reflection of localReflections) {
    const created = await createReflection(
      userId,
      reflection.year,
      reflection.period,
      reflection.mode,
      reflection.upgradedFrom
    );

    if (created) {
      // Update with additional fields
      await updateReflection(created.id, {
        progress: reflection.progress,
        completed: reflection.completed,
        completedAt: reflection.completedAt,
      });

      // Save responses
      if (Object.keys(reflection.responses).length > 0) {
        await saveResponses(created.id, reflection.responses);
      }

      migrated++;
    }
  }

  return { success: true, migrated };
}
