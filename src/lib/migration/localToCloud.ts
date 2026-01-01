import { Reflection, Journey, Achievement, ReflectionPeriod } from '../types';
import * as db from '../supabase/database';

interface LocalStorageData {
  journeys: Record<number, Journey>;
  reflections: Reflection[];
  achievements: Achievement[];
}

interface MigrationResult {
  success: boolean;
  migratedReflections: number;
  migratedAchievements: number;
  errors: string[];
}

/**
 * Parse localStorage data for migration
 */
export function getLocalStorageData(): LocalStorageData | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('lifecompass-storage');
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    const state = parsed.state || {};

    return {
      journeys: state.journeys || {},
      reflections: state.reflections || [],
      achievements: state.achievements || [],
    };
  } catch {
    return null;
  }
}

/**
 * Check if there's local data worth migrating
 */
export function hasLocalDataToMigrate(): boolean {
  const data = getLocalStorageData();
  if (!data) return false;

  const hasJourneys = Object.keys(data.journeys).length > 0;
  const hasReflections = data.reflections.length > 0;
  const hasAchievements = data.achievements.length > 0;

  return hasJourneys || hasReflections || hasAchievements;
}

/**
 * Get summary of local data for display
 */
export function getLocalDataSummary(): {
  reflectionCount: number;
  achievementCount: number;
  years: number[];
} {
  const data = getLocalStorageData();
  if (!data) {
    return { reflectionCount: 0, achievementCount: 0, years: [] };
  }

  // Combine journeys and reflections
  const journeyYears = Object.keys(data.journeys).map(Number);
  const reflectionYears = data.reflections.map(r => r.year);
  const allYears = Array.from(new Set([...journeyYears, ...reflectionYears])).sort((a, b) => b - a);

  const reflectionCount = Object.keys(data.journeys).length + data.reflections.length;
  const achievementCount = data.achievements.length;

  return { reflectionCount, achievementCount, years: allYears };
}

/**
 * Convert a legacy Journey to a Reflection
 */
function journeyToReflection(journey: Journey): Reflection {
  return {
    id: journey.id,
    year: journey.year,
    period: 'year_end' as ReflectionPeriod,
    mode: journey.mode,
    responses: journey.responses,
    progress: journey.progress,
    completed: journey.completed,
    startedAt: new Date(journey.startedAt),
    completedAt: journey.completedAt ? new Date(journey.completedAt) : undefined,
    localOnly: true,
  };
}

/**
 * Migrate local data to cloud for a user
 */
export async function migrateLocalToCloud(userId: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedReflections: 0,
    migratedAchievements: 0,
    errors: [],
  };

  const data = getLocalStorageData();
  if (!data) {
    return result;
  }

  // Collect all reflections (from journeys + reflections array)
  const reflectionsToMigrate: Reflection[] = [];

  // Convert legacy journeys
  Object.values(data.journeys).forEach(journey => {
    reflectionsToMigrate.push(journeyToReflection(journey));
  });

  // Add existing reflections (avoiding duplicates by ID)
  const existingIds = new Set(reflectionsToMigrate.map(r => r.id));
  data.reflections.forEach(reflection => {
    if (!existingIds.has(reflection.id)) {
      reflectionsToMigrate.push(reflection);
    }
  });

  // Migrate each reflection
  for (const reflection of reflectionsToMigrate) {
    try {
      const created = await db.createReflection(
        userId,
        reflection.year,
        reflection.period,
        reflection.mode,
        reflection.upgradedFrom
      );

      if (created) {
        // Update with completion status
        await db.updateReflection(created.id, {
          progress: reflection.progress,
          completed: reflection.completed,
          completedAt: reflection.completedAt,
        });

        // Migrate responses
        if (Object.keys(reflection.responses).length > 0) {
          await db.saveResponses(created.id, reflection.responses);
        }

        result.migratedReflections++;
      }
    } catch (error) {
      result.errors.push(`Failed to migrate reflection ${reflection.year}: ${error}`);
    }
  }

  // Migrate achievements
  for (const achievement of data.achievements) {
    try {
      const success = await db.unlockAchievement(userId, achievement.type);
      if (success) {
        result.migratedAchievements++;
      }
    } catch (error) {
      result.errors.push(`Failed to migrate achievement ${achievement.type}: ${error}`);
    }
  }

  if (result.errors.length > 0) {
    result.success = false;
  }

  return result;
}

/**
 * Clear local storage after successful migration
 */
export function clearLocalStorageAfterMigration(): void {
  if (typeof window === 'undefined') return;

  try {
    // Don't completely remove - keep theme and other UI preferences
    const stored = localStorage.getItem('lifecompass-storage');
    if (!stored) return;

    const parsed = JSON.parse(stored);
    const state = parsed.state || {};

    // Clear only the data that was migrated
    const newState = {
      ...state,
      journeys: {},
      reflections: [],
      achievements: [],
      // Keep UI state
      theme: state.theme,
      hasSeenWelcome: state.hasSeenWelcome,
      isGuest: false, // They're now logged in
    };

    localStorage.setItem('lifecompass-storage', JSON.stringify({ state: newState }));
  } catch {
    // If anything fails, don't crash
  }
}
