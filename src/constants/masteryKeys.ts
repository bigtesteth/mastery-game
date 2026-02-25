import { MasteryKey } from '../types';

export const MASTERY_KEYS: MasteryKey[] = [
  {
    id: 'mk_1',
    title: 'Value the Learning',
    quote: 'The first move toward mastery is always inward — learning who you really are and reconnecting with that innate force.',
    author: 'Robert Greene',
    unlockedAtMinutes: 60,
  },
  {
    id: 'mk_2',
    title: 'Submit to Reality',
    quote: 'The apprenticeship phase is not merely a period of learning; it is a rite of passage that tests your resilience and character.',
    author: 'Robert Greene',
    unlockedAtMinutes: 300,
  },
  {
    id: 'mk_3',
    title: 'Absorb the Master\'s Power',
    quote: 'See your mentor as a kind of psychic father or mother who is going to give you the love and knowledge you need.',
    author: 'Robert Greene',
    unlockedAtMinutes: 600,
  },
  {
    id: 'mk_4',
    title: 'The Ideal Apprenticeship',
    quote: 'The greatest danger you face is your fondness for comfort. All of the things that feel natural to you now were once learned, and practice will make anything feel natural.',
    author: 'Robert Greene',
    unlockedAtMinutes: 1500,
  },
  {
    id: 'mk_5',
    title: 'Develop Negative Capability',
    quote: 'Masters are those who by nature have retained and can access that childlike spirit of open wonder.',
    author: 'Robert Greene',
    unlockedAtMinutes: 3000,
  },
  {
    id: 'mk_6',
    title: 'The Creative Breakthrough',
    quote: 'The intuitive mind is a sacred gift and the rational mind is a faithful servant. We have created a society that honors the servant and has forgotten the gift.',
    author: 'Albert Einstein',
    unlockedAtMinutes: 6000,
  },
  {
    id: 'mk_7',
    title: 'Fuse the Intuitive with the Rational',
    quote: 'At the highest level of mastery, the distinction between thinking and feeling disappears.',
    author: 'Robert Greene',
    unlockedAtMinutes: 12000,
  },
  {
    id: 'mk_8',
    title: 'The Tenth Essence',
    quote: 'The future belongs to those who learn more skills and combine them in creative ways.',
    author: 'Robert Greene',
    unlockedAtMinutes: 30000,
  },
];

export const PHASE_THRESHOLDS = {
  apprentice: 0,
  creative: 500 * 60,   // 500 hours in minutes
  master: 5000 * 60,    // 5000 hours in minutes
};

export const DOMAIN_LABELS: Record<string, string> = {
  music: 'Music',
  coding: 'Coding',
  writing: 'Writing',
  chess: 'Chess',
  martial_arts: 'Martial Arts',
  art: 'Visual Art',
  science: 'Science',
  business: 'Business',
  language: 'Language',
  other: 'Other',
};

export const HISTORICAL_MENTORS = [
  { name: 'Leonardo da Vinci', domain: 'Art & Science' },
  { name: 'Benjamin Franklin', domain: 'Science & Diplomacy' },
  { name: 'Charles Darwin', domain: 'Natural Science' },
  { name: 'John Coltrane', domain: 'Music' },
  { name: 'Bobby Fischer', domain: 'Chess' },
  { name: 'Temple Grandin', domain: 'Animal Science' },
  { name: 'Freddie Roach', domain: 'Boxing' },
  { name: 'Martha Graham', domain: 'Dance' },
];
