import { Question } from './types';

export const QUESTIONS: Question[] = [
  // === PART 1: THE PAST YEAR ===

  // Deep only: Month by month calendar
  {
    id: 'calendar',
    section: 'past',
    type: 'calendar',
    title: 'Your Year in Review',
    prompt: 'Go through each month. What were the key events, moments, or milestones?',
    placeholder: 'What happened this month...',
    modes: ['deep'],
    quote: '"The unexamined life is not worth living." — Socrates',
  },

  // Ok + Deep: Title your year
  {
    id: 'year_title',
    section: 'past',
    type: 'text',
    title: 'Title Your Year',
    prompt: 'If a book or movie was made about your year, what would the title be?',
    placeholder: 'My year was called...',
    modes: ['ok', 'deep'],
    quote: '"Every story has a title. What\'s yours?"',
  },

  // All modes: 3 words
  {
    id: 'three_words',
    section: 'past',
    type: 'list',
    title: 'Three Words',
    prompt: 'Choose three words that define your past year.',
    placeholder: 'One word that captures this year...',
    modes: ['quick', 'ok', 'deep'],
    listCount: 3,
    quote: '"In the beginning was the Word." — John 1:1',
  },

  // Deep only: Best moments (detailed)
  {
    id: 'best_moments',
    section: 'past',
    type: 'textarea',
    title: 'Best Moments',
    prompt: 'Describe your happiest, most memorable moments. How did you feel? Who was there? What made them special?',
    placeholder: 'My most treasured moments were...',
    modes: ['deep'],
    quote: '"Collect moments, not things."',
  },

  // All modes: 3 accomplishments
  {
    id: 'accomplishments',
    section: 'past',
    type: 'list',
    title: 'Biggest Accomplishments',
    prompt: 'What are the three things you\'re most proud of achieving this year?',
    placeholder: 'I accomplished...',
    modes: ['quick', 'ok', 'deep'],
    listCount: 3,
    quote: '"Success is not final, failure is not fatal: it is the courage to continue that counts." — Winston Churchill',
  },

  // Ok + Deep: 3 challenges
  {
    id: 'challenges',
    section: 'past',
    type: 'list',
    title: 'Biggest Challenges',
    prompt: 'What were the three biggest challenges you faced this year?',
    placeholder: 'I struggled with...',
    modes: ['ok', 'deep'],
    listCount: 3,
    quote: '"The obstacle is the way." — Marcus Aurelius',
  },

  // Deep only: 3 important people
  {
    id: 'important_people',
    section: 'past',
    type: 'list',
    title: 'Most Important People',
    prompt: 'Who were the three most important people in your year? Why did they matter?',
    placeholder: 'This person was important because...',
    modes: ['deep'],
    listCount: 3,
    quote: '"We are the average of the five people we spend the most time with." — Jim Rohn',
  },

  // Ok + Deep: 3 wisest decisions
  {
    id: 'wisest_decisions',
    section: 'past',
    type: 'list',
    title: 'Wisest Decisions',
    prompt: 'What were the three wisest decisions you made this year?',
    placeholder: 'I wisely chose to...',
    modes: ['ok', 'deep'],
    listCount: 3,
    quote: '"In any moment of decision, the best thing you can do is the right thing." — Theodore Roosevelt',
  },

  // Deep only: 3 biggest lessons
  {
    id: 'lessons',
    section: 'past',
    type: 'list',
    title: 'Biggest Lessons',
    prompt: 'What were the three most important lessons you learned this year?',
    placeholder: 'I learned that...',
    modes: ['deep'],
    listCount: 3,
    quote: '"The only real mistake is the one from which we learn nothing." — Henry Ford',
  },

  // All modes: Gratitude
  {
    id: 'gratitude',
    section: 'past',
    type: 'textarea',
    title: 'Gratitude',
    prompt: 'What are you most grateful for this year?',
    placeholder: 'I am grateful for...',
    modes: ['quick', 'ok', 'deep'],
    quote: '"Gratitude turns what we have into enough."',
  },

  // All modes: Rate life areas
  {
    id: 'life_areas_past',
    section: 'past',
    type: 'rating',
    title: 'Life Areas Rating',
    prompt: 'How satisfied were you with each area of your life this year? (1 = very unsatisfied, 10 = couldn\'t be better)',
    modes: ['quick', 'ok', 'deep'],
    quote: '"Balance is not something you find, it\'s something you create." — Jana Kingsford',
  },

  // Ok + Deep: Forgiveness
  {
    id: 'forgiveness',
    section: 'past',
    type: 'textarea',
    title: 'Forgiveness',
    prompt: 'What do you need to forgive yourself for? What mistakes or regrets can you let go of?',
    placeholder: 'I forgive myself for...',
    modes: ['ok', 'deep'],
    quote: '"Forgiveness is the fragrance that the violet sheds on the heel that has crushed it." — Mark Twain',
  },

  // Ok + Deep: Letting go
  {
    id: 'letting_go',
    section: 'past',
    type: 'textarea',
    title: 'Letting Go',
    prompt: 'What beliefs, habits, or grudges are you ready to release? What no longer serves you?',
    placeholder: 'I let go of...',
    modes: ['ok', 'deep'],
    quote: '"Some of us think holding on makes us strong, but sometimes it is letting go." — Hermann Hesse',
  },

  // === PART 2: THE YEAR AHEAD ===

  // Deep only: Daydream
  {
    id: 'daydream',
    section: 'future',
    type: 'textarea',
    title: 'Daydream',
    prompt: 'Close your eyes. Imagine your ideal year ahead. What do you see? Where are you? How do you feel? What have you accomplished?',
    placeholder: 'In my ideal year, I see...',
    modes: ['deep'],
    quote: '"The future belongs to those who believe in the beauty of their dreams." — Eleanor Roosevelt',
  },

  // All modes: 3 dreams/wishes
  {
    id: 'dreams',
    section: 'future',
    type: 'list',
    title: 'Dreams & Wishes',
    prompt: 'What are your three biggest dreams or wishes for the coming year?',
    placeholder: 'I dream of...',
    modes: ['quick', 'ok', 'deep'],
    listCount: 3,
    quote: '"A dream you dream alone is only a dream. A dream you dream together is reality." — Yoko Ono',
  },

  // All modes: Word of the year
  {
    id: 'word_of_year',
    section: 'future',
    type: 'word',
    title: 'Word of the Year',
    prompt: 'Pick one word to define and guide your upcoming year. This word will be your compass when you need direction.',
    placeholder: 'My word is...',
    modes: ['quick', 'ok', 'deep'],
    quote: '"One word frees us of all the weight and pain of life: that word is love." — Sophocles',
  },

  // Ok + Deep: This year will be special
  {
    id: 'special_because',
    section: 'future',
    type: 'textarea',
    title: 'This Year Will Be Special',
    prompt: 'Complete this sentence: "This year will be special for me because..."',
    placeholder: 'This year will be special because...',
    modes: ['ok', 'deep'],
    quote: '"The magic you are looking for is in the work you are avoiding."',
  },

  // Ok + Deep: I advise myself
  {
    id: 'self_advice',
    section: 'future',
    type: 'textarea',
    title: 'Advice to Yourself',
    prompt: 'What advice would you give yourself for the year ahead?',
    placeholder: 'I advise myself to...',
    modes: ['ok', 'deep'],
    quote: '"Be yourself; everyone else is already taken." — Oscar Wilde',
  },

  // Deep only: Goals for each life area
  {
    id: 'life_area_goals',
    section: 'future',
    type: 'list',
    title: 'Life Area Goals',
    prompt: 'Set one specific goal for each area of your life.',
    placeholder: 'My goal for this area is...',
    modes: ['deep'],
    listCount: 7,
    quote: '"Setting goals is the first step in turning the invisible into the visible." — Tony Robbins',
  },

  // All modes: Secret wish
  {
    id: 'secret_wish',
    section: 'future',
    type: 'textarea',
    title: 'Secret Wish',
    prompt: 'What is your deepest, secret wish for this year? (No one else needs to know)',
    placeholder: 'My secret wish is...',
    modes: ['quick', 'ok', 'deep'],
    quote: '"When you want something, all the universe conspires in helping you to achieve it." — Paulo Coelho',
  },

  // All modes: Commitment
  {
    id: 'commitment',
    section: 'future',
    type: 'textarea',
    title: 'Your Commitment',
    prompt: 'Write your commitment statement. How will you make this year meaningful?',
    placeholder: 'I commit to making this year meaningful by...',
    modes: ['quick', 'ok', 'deep'],
    quote: '"The future depends on what you do today." — Mahatma Gandhi',
  },
];

export const getQuestionsForMode = (mode: 'quick' | 'ok' | 'deep'): Question[] => {
  return QUESTIONS.filter(q => q.modes.includes(mode));
};

export const getQuestionsBySection = (questions: Question[], section: 'past' | 'future'): Question[] => {
  return questions.filter(q => q.section === section);
};

export const MOTIVATIONAL_QUOTES = [
  '"The journey of a thousand miles begins with a single step." — Lao Tzu',
  '"What lies behind us and what lies before us are tiny matters compared to what lies within us." — Ralph Waldo Emerson',
  '"Your life is your story. Write well. Edit often."',
  '"The only way to do great work is to love what you do." — Steve Jobs',
  '"In the middle of difficulty lies opportunity." — Albert Einstein',
  '"Be the change you wish to see in the world." — Mahatma Gandhi',
  '"Every moment is a fresh beginning." — T.S. Eliot',
  '"The best time to plant a tree was 20 years ago. The second best time is now." — Chinese Proverb',
];
