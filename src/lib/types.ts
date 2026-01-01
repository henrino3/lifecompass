export type Theme = 'cosmic' | 'calm' | 'minimal' | 'sunset';

export type Mode = 'quick' | 'ok' | 'deep';

export type QuestionType = 'text' | 'textarea' | 'list' | 'rating' | 'word' | 'calendar';

export type Section = 'past' | 'future';

export interface Question {
  id: string;
  section: Section;
  type: QuestionType;
  title: string;
  prompt: string;
  placeholder?: string;
  modes: Mode[];
  listCount?: number;
  quote?: string;
}

export interface LifeArea {
  id: string;
  name: string;
  icon: string;
}

export interface JourneyResponse {
  questionId: string;
  value: string | string[] | number | Record<string, number>;
  updatedAt: Date;
}

export interface Journey {
  id: string;
  year: number;
  mode: Mode;
  responses: Record<string, JourneyResponse>;
  progress: number;
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  theme: Theme;
  journeys: Journey[];
}

export interface Achievement {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export type AchievementType =
  | 'first_journey'
  | 'deep_thinker'
  | 'speed_runner'
  | 'consistent'
  | 'all_areas'
  | 'word_master'
  | 'sharer';

export interface ShareCard {
  id: string;
  type: 'word_of_year' | 'accomplishments' | 'gratitude' | 'dreams';
  content: Record<string, unknown>;
  year: number;
  createdAt: Date;
}

export const LIFE_AREAS: LifeArea[] = [
  { id: 'personal_growth', name: 'Personal Growth', icon: '🌱' },
  { id: 'work_career', name: 'Work & Career', icon: '💼' },
  { id: 'health_fitness', name: 'Health & Fitness', icon: '💪' },
  { id: 'relationships', name: 'Relationships', icon: '❤️' },
  { id: 'fun_recreation', name: 'Fun & Recreation', icon: '🎉' },
  { id: 'finances', name: 'Finances', icon: '💰' },
  { id: 'spirituality', name: 'Spirituality & Inner Peace', icon: '🧘' },
];

export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  {
    id: 'first_journey',
    type: 'first_journey',
    name: 'First Steps',
    description: 'Complete your first reflection journey',
    icon: '🚀',
  },
  {
    id: 'deep_thinker',
    type: 'deep_thinker',
    name: 'Deep Thinker',
    description: 'Complete a Deep Think journey',
    icon: '🧠',
  },
  {
    id: 'speed_runner',
    type: 'speed_runner',
    name: 'Speed Runner',
    description: 'Complete Quick mode in under 10 minutes',
    icon: '⚡',
  },
  {
    id: 'consistent',
    type: 'consistent',
    name: 'Consistent',
    description: 'Complete journeys 2 years in a row',
    icon: '📅',
  },
  {
    id: 'all_areas',
    type: 'all_areas',
    name: 'Balanced Life',
    description: 'Rate all 7 life areas as 7 or higher',
    icon: '⚖️',
  },
  {
    id: 'word_master',
    type: 'word_master',
    name: 'Word Master',
    description: 'Set your word of the year 3 times',
    icon: '📝',
  },
  {
    id: 'sharer',
    type: 'sharer',
    name: 'Sharer',
    description: 'Create your first shareable card',
    icon: '🔗',
  },
];

export const MODE_INFO: Record<Mode, { name: string; time: string; description: string }> = {
  quick: {
    name: 'Quick',
    time: '~15 min',
    description: "I've got no time — just the essentials",
  },
  ok: {
    name: 'Just Ok',
    time: '~45 min',
    description: 'A balanced reflection with key insights',
  },
  deep: {
    name: 'Deep Think',
    time: '~90 min',
    description: 'Dive deep into every aspect of your year',
  },
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
