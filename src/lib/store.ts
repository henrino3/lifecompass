'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Theme, Mode, Journey, JourneyResponse, Achievement, ACHIEVEMENTS,
  Reflection, ReflectionPeriod, UserProfile
} from './types';
import { getQuestionsForMode } from './questions';
import * as db from './supabase/database';

// Helper to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Calculate progress for a given set of responses and mode
const calculateProgress = (responses: Record<string, JourneyResponse>, mode: Mode): number => {
  const questions = getQuestionsForMode(mode);
  const answeredCount = questions.filter((q) => {
    const response = responses[q.id];
    if (!response) return false;
    const value = response.value;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.some((v) => v.trim().length > 0);
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  }).length;
  return Math.round((answeredCount / questions.length) * 100);
};

interface CompassState {
  // User & Auth
  user: UserProfile | null;
  isGuest: boolean;
  setUser: (user: UserProfile | null) => void;
  setIsGuest: (isGuest: boolean) => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Current reflection (active journey)
  currentReflection: Reflection | null;
  currentQuestionIndex: number;
  responses: Record<string, JourneyResponse>;
  setCurrentQuestionIndex: (index: number) => void;
  setResponse: (questionId: string, value: JourneyResponse['value']) => void;
  getProgress: () => number;

  // All reflections (history)
  reflections: Reflection[];

  // Legacy journeys (for backward compatibility)
  journeys: Record<number, Journey>;
  currentYear: number;
  mode: Mode | null;
  setMode: (mode: Mode) => void;

  // Reflection actions
  startReflection: (year: number, mode: Mode, period: ReflectionPeriod) => void;
  completeReflection: () => void;
  loadReflection: (reflectionId: string) => void;

  // Mode upgrade
  upgradeMode: (fromReflectionId: string, toMode: Mode) => void;
  canUpgrade: (reflection: Reflection) => { canUpgrade: boolean; availableModes: Mode[] };

  // Legacy actions (for backward compatibility)
  startJourney: (year: number, mode: Mode) => void;
  completeJourney: () => void;

  // Achievements
  achievements: Achievement[];
  unlockAchievement: (type: Achievement['type']) => void;
  checkAchievements: () => void;

  // Auto-save indicator
  lastSaved: Date | null;
  setLastSaved: (date: Date) => void;

  // App state
  hasSeenWelcome: boolean;
  setHasSeenWelcome: (seen: boolean) => void;
  journeyStartedAt: Date | null;

  // Sync state
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncedAt: Date | null;
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;

  // Reset
  resetCurrentJourney: () => void;

  // Migration helper
  migrateJourneysToReflections: () => void;
}

export const useCompassStore = create<CompassState>()(
  persist(
    (set, get) => ({
      // User & Auth
      user: null,
      isGuest: true,
      setUser: (user) => set({ user, isGuest: !user }),
      setIsGuest: (isGuest) => set({ isGuest }),

      // Theme
      theme: 'cosmic',
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },

      // Current reflection state
      currentReflection: null,
      currentQuestionIndex: 0,
      responses: {},
      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),

      setResponse: (questionId, value) => {
        const now = new Date();
        const state = get();

        const newResponse: JourneyResponse = {
          questionId,
          value,
          updatedAt: now,
        };

        set({
          responses: {
            ...state.responses,
            [questionId]: newResponse,
          },
          lastSaved: now,
        });

        // Update current reflection's responses
        if (state.currentReflection) {
          set({
            currentReflection: {
              ...state.currentReflection,
              responses: {
                ...state.currentReflection.responses,
                [questionId]: newResponse,
              },
            },
          });
        }

        // Sync to cloud if authenticated (debounced in real app)
        if (state.user && state.currentReflection) {
          db.saveResponse(state.currentReflection.id, questionId, value).catch(console.error);
        }
      },

      getProgress: () => {
        const state = get();
        const mode = state.currentReflection?.mode || state.mode;
        if (!mode) return 0;
        return calculateProgress(state.responses, mode);
      },

      // All reflections
      reflections: [],

      // Legacy state (backward compatibility)
      journeys: {},
      currentYear: new Date().getFullYear(),
      mode: null,
      setMode: (mode) => set({ mode }),

      // Start a new reflection
      startReflection: (year, mode, period) => {
        const now = new Date();
        const state = get();

        const newReflection: Reflection = {
          id: generateId(),
          userId: state.user?.id,
          year,
          period,
          mode,
          responses: {},
          progress: 0,
          completed: false,
          startedAt: now,
          localOnly: !state.user,
        };

        set({
          currentReflection: newReflection,
          currentYear: year,
          mode,
          currentQuestionIndex: 0,
          responses: {},
          journeyStartedAt: now,
        });

        // Create in cloud if authenticated
        if (state.user) {
          db.createReflection(state.user.id, year, period, mode).then((created) => {
            if (created) {
              set({ currentReflection: { ...newReflection, id: created.id, localOnly: false } });
            }
          }).catch(console.error);
        }
      },

      // Complete current reflection
      completeReflection: () => {
        const state = get();
        const now = new Date();

        if (!state.currentReflection) return;

        const completedReflection: Reflection = {
          ...state.currentReflection,
          responses: state.responses,
          progress: 100,
          completed: true,
          completedAt: now,
        };

        // Update reflections array
        const existingIndex = state.reflections.findIndex(r => r.id === completedReflection.id);
        const newReflections = existingIndex >= 0
          ? state.reflections.map((r, i) => i === existingIndex ? completedReflection : r)
          : [...state.reflections, completedReflection];

        // Also update legacy journeys for backward compatibility
        const legacyJourney: Journey = {
          id: completedReflection.id,
          year: completedReflection.year,
          mode: completedReflection.mode,
          responses: completedReflection.responses,
          progress: 100,
          completed: true,
          startedAt: completedReflection.startedAt,
          completedAt: now,
        };

        set({
          reflections: newReflections,
          currentReflection: completedReflection,
          journeys: {
            ...state.journeys,
            [completedReflection.year]: legacyJourney,
          },
        });

        // Sync to cloud
        if (state.user) {
          db.updateReflection(completedReflection.id, {
            progress: 100,
            completed: true,
            completedAt: now,
          }).catch(console.error);
          db.saveResponses(completedReflection.id, state.responses).catch(console.error);
        }

        // Check achievements
        get().checkAchievements();
      },

      // Load an existing reflection
      loadReflection: (reflectionId) => {
        const state = get();
        const reflection = state.reflections.find(r => r.id === reflectionId);

        if (!reflection) return;

        set({
          currentReflection: reflection,
          currentYear: reflection.year,
          mode: reflection.mode,
          responses: reflection.responses,
          currentQuestionIndex: 0,
          journeyStartedAt: reflection.startedAt,
        });
      },

      // Mode upgrade: Create new reflection with pre-filled responses from a lower mode
      upgradeMode: (fromReflectionId, toMode) => {
        const state = get();
        const sourceReflection = state.reflections.find(r => r.id === fromReflectionId);

        if (!sourceReflection) {
          console.error('Source reflection not found');
          return;
        }

        // Validate upgrade path
        const modeOrder = { quick: 0, ok: 1, deep: 2 };
        if (modeOrder[toMode] <= modeOrder[sourceReflection.mode]) {
          console.error('Can only upgrade to a higher mode');
          return;
        }

        const now = new Date();

        // Create new reflection with copied responses
        const upgradedReflection: Reflection = {
          id: generateId(),
          userId: state.user?.id,
          year: sourceReflection.year,
          period: sourceReflection.period,
          mode: toMode,
          responses: { ...sourceReflection.responses }, // Pre-fill with existing answers
          progress: calculateProgress(sourceReflection.responses, toMode),
          completed: false,
          startedAt: now,
          upgradedFrom: fromReflectionId,
          localOnly: !state.user,
        };

        set({
          currentReflection: upgradedReflection,
          currentYear: sourceReflection.year,
          mode: toMode,
          responses: { ...sourceReflection.responses },
          currentQuestionIndex: 0,
          journeyStartedAt: now,
          reflections: [...state.reflections, upgradedReflection],
        });

        // Create in cloud if authenticated
        if (state.user) {
          db.createReflection(
            state.user.id,
            sourceReflection.year,
            sourceReflection.period,
            toMode,
            fromReflectionId
          ).then(async (created) => {
            if (created) {
              // Copy responses to new reflection
              await db.saveResponses(created.id, sourceReflection.responses);
              set({
                currentReflection: { ...upgradedReflection, id: created.id, localOnly: false },
                reflections: state.reflections.map(r =>
                  r.id === upgradedReflection.id ? { ...upgradedReflection, id: created.id, localOnly: false } : r
                ),
              });
            }
          }).catch(console.error);
        }
      },

      // Check if a reflection can be upgraded
      canUpgrade: (reflection) => {
        if (reflection.mode === 'deep') {
          return { canUpgrade: false, availableModes: [] };
        }

        const availableModes: Mode[] = [];
        if (reflection.mode === 'quick') {
          availableModes.push('ok', 'deep');
        } else if (reflection.mode === 'ok') {
          availableModes.push('deep');
        }

        return { canUpgrade: availableModes.length > 0, availableModes };
      },

      // Legacy: Start journey (for backward compatibility)
      startJourney: (year, mode) => {
        get().startReflection(year, mode, 'year_end');
      },

      // Legacy: Complete journey
      completeJourney: () => {
        get().completeReflection();
      },

      // Achievements
      achievements: [],
      unlockAchievement: (type) => {
        const achievementDef = ACHIEVEMENTS.find((a) => a.type === type);
        if (!achievementDef) return;

        set((state) => {
          const exists = state.achievements.some((a) => a.type === type);
          if (exists) return state;

          const newAchievement = { ...achievementDef, unlockedAt: new Date() };

          // Save to cloud if authenticated
          if (state.user) {
            db.unlockAchievement(state.user.id, type).catch(console.error);
          }

          return {
            achievements: [...state.achievements, newAchievement],
          };
        });
      },

      checkAchievements: () => {
        const state = get();

        // First journey
        if (state.reflections.filter(r => r.completed).length >= 1) {
          state.unlockAchievement('first_journey');
        }

        // Deep thinker
        const hasDeepReflection = state.reflections.some(
          (r) => r.mode === 'deep' && r.completed
        );
        if (hasDeepReflection) {
          state.unlockAchievement('deep_thinker');
        }

        // Speed runner (quick mode in under 10 minutes)
        const latestReflection = state.reflections
          .filter(r => r.completed)
          .sort((a, b) =>
            new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()
          )[0];

        if (latestReflection?.mode === 'quick' && latestReflection.completedAt && latestReflection.startedAt) {
          const duration = new Date(latestReflection.completedAt).getTime() -
                          new Date(latestReflection.startedAt).getTime();
          if (duration < 10 * 60 * 1000) {
            state.unlockAchievement('speed_runner');
          }
        }

        // Consistent (2 years in a row)
        const years = Array.from(new Set(state.reflections.filter(r => r.completed).map(r => r.year))).sort();
        for (let i = 1; i < years.length; i++) {
          if (years[i] - years[i - 1] === 1) {
            state.unlockAchievement('consistent');
            break;
          }
        }

        // All areas (all life areas rated 7+)
        const lifeAreasResponse = state.responses['life_areas_past'];
        if (lifeAreasResponse && typeof lifeAreasResponse.value === 'object' && !Array.isArray(lifeAreasResponse.value)) {
          const ratings = Object.values(lifeAreasResponse.value as Record<string, number>);
          if (ratings.length === 7 && ratings.every((r) => r >= 7)) {
            state.unlockAchievement('all_areas');
          }
        }

        // Word master (set word of year 3 times)
        const reflectionsWithWord = state.reflections.filter(
          (r) => r.responses['word_of_year']?.value
        );
        if (reflectionsWithWord.length >= 3) {
          state.unlockAchievement('word_master');
        }
      },

      // Auto-save
      lastSaved: null,
      setLastSaved: (date) => set({ lastSaved: date }),

      // Welcome
      hasSeenWelcome: false,
      setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),

      // Journey started at
      journeyStartedAt: null,

      // Sync
      syncStatus: 'idle',
      lastSyncedAt: null,

      syncToCloud: async () => {
        const state = get();
        if (!state.user) return;

        set({ syncStatus: 'syncing' });

        try {
          // Sync current reflection
          if (state.currentReflection && !state.currentReflection.localOnly) {
            await db.updateReflection(state.currentReflection.id, {
              progress: state.getProgress(),
              completed: state.currentReflection.completed,
              completedAt: state.currentReflection.completedAt,
            });
            await db.saveResponses(state.currentReflection.id, state.responses);
          }

          set({ syncStatus: 'idle', lastSyncedAt: new Date() });
        } catch (error) {
          console.error('Sync failed:', error);
          set({ syncStatus: 'error' });
        }
      },

      loadFromCloud: async () => {
        const state = get();
        if (!state.user) return;

        set({ syncStatus: 'syncing' });

        try {
          const reflections = await db.getReflections(state.user.id);
          const achievements = await db.getAchievements(state.user.id);

          // Merge with ACHIEVEMENTS constant to get names/descriptions
          const fullAchievements = achievements.map(a => {
            const def = ACHIEVEMENTS.find(d => d.type === a.type);
            return def ? { ...def, unlockedAt: a.unlockedAt } : a;
          });

          set({
            reflections,
            achievements: fullAchievements as Achievement[],
            syncStatus: 'idle',
            lastSyncedAt: new Date()
          });
        } catch (error) {
          console.error('Load from cloud failed:', error);
          set({ syncStatus: 'error' });
        }
      },

      // Reset
      resetCurrentJourney: () =>
        set({
          currentReflection: null,
          mode: null,
          currentQuestionIndex: 0,
          responses: {},
          journeyStartedAt: null,
        }),

      // Migrate old journeys to new reflections format
      migrateJourneysToReflections: () => {
        const state = get();
        const existingReflectionIds = new Set(state.reflections.map(r => r.id));

        const migratedReflections: Reflection[] = Object.values(state.journeys)
          .filter(j => !existingReflectionIds.has(j.id))
          .map(journey => ({
            id: journey.id,
            year: journey.year,
            period: 'year_end' as ReflectionPeriod,
            mode: journey.mode,
            responses: journey.responses,
            progress: journey.progress,
            completed: journey.completed,
            startedAt: journey.startedAt,
            completedAt: journey.completedAt,
            localOnly: true,
          }));

        if (migratedReflections.length > 0) {
          set({ reflections: [...state.reflections, ...migratedReflections] });
        }
      },
    }),
    {
      name: 'lifecompass-storage',
      partialize: (state) => ({
        theme: state.theme,
        journeys: state.journeys,
        reflections: state.reflections,
        achievements: state.achievements,
        hasSeenWelcome: state.hasSeenWelcome,
        isGuest: state.isGuest,
        // Persist current journey progress
        currentYear: state.currentYear,
        mode: state.mode,
        currentQuestionIndex: state.currentQuestionIndex,
        responses: state.responses,
        journeyStartedAt: state.journeyStartedAt,
        currentReflection: state.currentReflection,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          // Migrate journeys to reflections on load
          if (state) {
            state.migrateJourneysToReflections();
          }
        };
      },
    }
  )
);

// Initialize theme on client
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('lifecompass-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const theme = parsed.state?.theme || 'cosmic';
      document.documentElement.setAttribute('data-theme', theme);
    } catch {
      document.documentElement.setAttribute('data-theme', 'cosmic');
    }
  }
}
