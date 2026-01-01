'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme, Mode, Journey, JourneyResponse, Achievement, ACHIEVEMENTS } from './types';
import { getQuestionsForMode } from './questions';

interface CompassState {
  // User preferences
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Current journey
  currentYear: number;
  mode: Mode | null;
  setMode: (mode: Mode) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;

  // Journey data
  journeys: Record<number, Journey>;
  responses: Record<string, JourneyResponse>;
  setResponse: (questionId: string, value: string | string[] | number | Record<string, number> | Record<string, string>) => void;
  getProgress: () => number;
  startJourney: (year: number, mode: Mode) => void;
  completeJourney: () => void;

  // Achievements
  achievements: Achievement[];
  unlockAchievement: (type: Achievement['type']) => void;
  checkAchievements: () => void;

  // Auto-save indicator
  lastSaved: Date | null;
  setLastSaved: (date: Date) => void;

  // Guest mode
  isGuest: boolean;
  setIsGuest: (isGuest: boolean) => void;

  // App state
  hasSeenWelcome: boolean;
  setHasSeenWelcome: (seen: boolean) => void;

  // Journey started at (for speed runner achievement)
  journeyStartedAt: Date | null;

  // Reset
  resetCurrentJourney: () => void;
}

export const useCompassStore = create<CompassState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'cosmic',
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },

      // Journey state
      currentYear: new Date().getFullYear(),
      mode: null,
      setMode: (mode) => set({ mode }),
      currentQuestionIndex: 0,
      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),

      // Journey data
      journeys: {},
      responses: {},
      setResponse: (questionId, value) => {
        const now = new Date();
        set((state) => ({
          responses: {
            ...state.responses,
            [questionId]: {
              questionId,
              value,
              updatedAt: now,
            },
          },
          lastSaved: now,
        }));
      },

      getProgress: () => {
        const state = get();
        if (!state.mode) return 0;
        const questions = getQuestionsForMode(state.mode);
        const answeredCount = questions.filter((q) => {
          const response = state.responses[q.id];
          if (!response) return false;
          const value = response.value;
          if (typeof value === 'string') return value.trim().length > 0;
          if (Array.isArray(value)) return value.some((v) => v.trim().length > 0);
          if (typeof value === 'object') return Object.keys(value).length > 0;
          return true;
        }).length;
        return Math.round((answeredCount / questions.length) * 100);
      },

      startJourney: (year, mode) => {
        const now = new Date();
        set({
          currentYear: year,
          mode,
          currentQuestionIndex: 0,
          responses: {},
          journeyStartedAt: now,
        });
      },

      completeJourney: () => {
        const state = get();
        const now = new Date();
        const journey: Journey = {
          id: `${state.currentYear}-${Date.now()}`,
          year: state.currentYear,
          mode: state.mode!,
          responses: state.responses,
          progress: 100,
          completed: true,
          startedAt: state.journeyStartedAt || now,
          completedAt: now,
        };

        set((state) => ({
          journeys: {
            ...state.journeys,
            [state.currentYear]: journey,
          },
        }));

        // Check achievements after completing
        get().checkAchievements();
      },

      // Achievements
      achievements: [],
      unlockAchievement: (type) => {
        const achievementDef = ACHIEVEMENTS.find((a) => a.type === type);
        if (!achievementDef) return;

        set((state) => {
          const exists = state.achievements.some((a) => a.type === type);
          if (exists) return state;

          return {
            achievements: [
              ...state.achievements,
              { ...achievementDef, unlockedAt: new Date() },
            ],
          };
        });
      },

      checkAchievements: () => {
        const state = get();

        // First journey
        if (Object.keys(state.journeys).length >= 1) {
          state.unlockAchievement('first_journey');
        }

        // Deep thinker
        const hasDeepJourney = Object.values(state.journeys).some(
          (j) => j.mode === 'deep' && j.completed
        );
        if (hasDeepJourney) {
          state.unlockAchievement('deep_thinker');
        }

        // Speed runner (quick mode in under 10 minutes)
        const latestJourney = Object.values(state.journeys).sort(
          (a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()
        )[0];
        if (latestJourney?.mode === 'quick' && latestJourney.completedAt && latestJourney.startedAt) {
          const duration = new Date(latestJourney.completedAt).getTime() - new Date(latestJourney.startedAt).getTime();
          if (duration < 10 * 60 * 1000) {
            state.unlockAchievement('speed_runner');
          }
        }

        // Consistent (2 years in a row)
        const years = Object.keys(state.journeys).map(Number).sort();
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
        const yearsWithWord = Object.values(state.journeys).filter(
          (j) => j.responses['word_of_year']?.value
        );
        if (yearsWithWord.length >= 3) {
          state.unlockAchievement('word_master');
        }
      },

      // Auto-save
      lastSaved: null,
      setLastSaved: (date) => set({ lastSaved: date }),

      // Guest mode
      isGuest: true,
      setIsGuest: (isGuest) => set({ isGuest }),

      // Welcome
      hasSeenWelcome: false,
      setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),

      // Journey started at
      journeyStartedAt: null,

      // Reset
      resetCurrentJourney: () =>
        set({
          mode: null,
          currentQuestionIndex: 0,
          responses: {},
          journeyStartedAt: null,
        }),
    }),
    {
      name: 'lifecompass-storage',
      partialize: (state) => ({
        theme: state.theme,
        journeys: state.journeys,
        achievements: state.achievements,
        hasSeenWelcome: state.hasSeenWelcome,
        isGuest: state.isGuest,
        // Persist current journey progress
        currentYear: state.currentYear,
        mode: state.mode,
        currentQuestionIndex: state.currentQuestionIndex,
        responses: state.responses,
        journeyStartedAt: state.journeyStartedAt,
      }),
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
