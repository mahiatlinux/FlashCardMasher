// src/types.ts

// Input format for flashcard generation
export type InputFormat = 'text' | 'pdf' | 'docx' | 'url';

// Difficulty levels for flashcards
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

// Flashcard generation options
export interface GenerationOptions {
  cardCount: number;
  difficulty: DifficultyLevel;
  termDefinition: boolean;
  questionAnswer: boolean;
}

// Processing state for flashcard generation
export interface ProcessingState {
  status: 'idle' | 'processing' | 'success' | 'error';
  progress: number;
  message: string;
  error: string | null;
}

// Flashcard model
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: DifficultyLevel;
  tags: string[];
  confidence?: number;
  lastStudied?: Date | null;
}

// Deck model
export interface Deck {
  id: string;
  name: string;
  description: string;
  cards: Flashcard[];
  created: Date;
  lastStudied?: Date | null;
  studyStreak?: number;
}

// Study session model
export interface StudySession {
  id: string;
  deckId: string;
  date: Date;
  cardsStudied: string[]; // Card IDs
  correctCount: number;
  incorrectCount: number;
  duration: number; // in seconds
}

// Auth user model
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}