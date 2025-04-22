import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Flashcard, FlashcardDeck, DifficultyLevel } from '../types';

interface FlashcardState {
  decks: FlashcardDeck[];
  currentDeckId: string | null;
  
  // Actions
  createDeck: (name: string, description: string, tags: string[]) => string;
  updateDeck: (id: string, updates: Partial<Omit<FlashcardDeck, 'id' | 'cards'>>) => void;
  deleteDeck: (id: string) => void;
  setCurrentDeck: (id: string | null) => void;
  
  addCard: (deckId: string, front: string, back: string, tags: string[], difficulty: DifficultyLevel) => string;
  updateCard: (deckId: string, cardId: string, updates: Partial<Omit<Flashcard, 'id'>>) => void;
  deleteCard: (deckId: string, cardId: string) => void;
  
  updateCardConfidence: (deckId: string, cardId: string, confidence: number) => void;
  recordStudySession: (deckId: string, cardIds: string[]) => void;
  
  // Utility functions
  getDeck: (id: string) => FlashcardDeck | undefined;
  getCard: (deckId: string, cardId: string) => Flashcard | undefined;
}

// Mock data for initial state
const createMockDecks = (): FlashcardDeck[] => {
  const mockCards: Flashcard[] = [
    {
      id: uuidv4(),
      front: "What is React?",
      back: "A JavaScript library for building user interfaces",
      tags: ["programming", "frontend"],
      difficulty: "medium",
      createdAt: new Date(),
      confidence: 0
    },
    {
      id: uuidv4(),
      front: "What is TypeScript?",
      back: "A strongly typed programming language that builds on JavaScript",
      tags: ["programming", "typescript"],
      difficulty: "medium",
      createdAt: new Date(),
      confidence: 0
    },
    {
      id: uuidv4(),
      front: "What is a closure in JavaScript?",
      back: "A function that has access to its own scope, the outer function's variables, and the global variables",
      tags: ["programming", "javascript"],
      difficulty: "hard",
      createdAt: new Date(),
      confidence: 0
    }
  ];

  return [
    {
      id: uuidv4(),
      name: "Web Development",
      description: "Key concepts in modern web development",
      cards: mockCards,
      createdAt: new Date(),
      tags: ["programming", "web"]
    }
  ];
};

export const useFlashcardStore = create<FlashcardState>()(
  persist(
    (set, get) => ({
      decks: createMockDecks(),
      currentDeckId: null,
      
      createDeck: (name, description, tags) => {
        const id = uuidv4();
        set((state) => ({
          decks: [
            ...state.decks,
            {
              id,
              name,
              description,
              cards: [],
              createdAt: new Date(),
              tags
            }
          ]
        }));
        return id;
      },
      
      updateDeck: (id, updates) => {
        set((state) => ({
          decks: state.decks.map((deck) => 
            deck.id === id ? { ...deck, ...updates } : deck
          )
        }));
      },
      
      deleteDeck: (id) => {
        set((state) => ({
          decks: state.decks.filter((deck) => deck.id !== id),
          currentDeckId: state.currentDeckId === id ? null : state.currentDeckId
        }));
      },
      
      setCurrentDeck: (id) => {
        set({ currentDeckId: id });
      },
      
      addCard: (deckId, front, back, tags, difficulty) => {
        const id = uuidv4();
        set((state) => ({
          decks: state.decks.map((deck) => 
            deck.id === deckId
              ? {
                  ...deck,
                  cards: [
                    ...deck.cards,
                    {
                      id,
                      front,
                      back,
                      tags,
                      difficulty,
                      createdAt: new Date(),
                      confidence: 0
                    }
                  ]
                }
              : deck
          )
        }));
        return id;
      },
      
      updateCard: (deckId, cardId, updates) => {
        set((state) => ({
          decks: state.decks.map((deck) => 
            deck.id === deckId
              ? {
                  ...deck,
                  cards: deck.cards.map((card) => 
                    card.id === cardId ? { ...card, ...updates } : card
                  )
                }
              : deck
          )
        }));
      },
      
      deleteCard: (deckId, cardId) => {
        set((state) => ({
          decks: state.decks.map((deck) => 
            deck.id === deckId
              ? {
                  ...deck,
                  cards: deck.cards.filter((card) => card.id !== cardId)
                }
              : deck
          )
        }));
      },
      
      updateCardConfidence: (deckId, cardId, confidence) => {
        set((state) => ({
          decks: state.decks.map((deck) => 
            deck.id === deckId
              ? {
                  ...deck,
                  cards: deck.cards.map((card) => 
                    card.id === cardId
                      ? { 
                          ...card, 
                          confidence,
                          lastStudied: new Date()
                        }
                      : card
                  )
                }
              : deck
          )
        }));
      },
      
      recordStudySession: (deckId, cardIds) => {
        set((state) => ({
          decks: state.decks.map((deck) => 
            deck.id === deckId
              ? {
                  ...deck,
                  lastStudied: new Date()
                }
              : deck
          )
        }));
      },
      
      getDeck: (id) => {
        return get().decks.find((deck) => deck.id === id);
      },
      
      getCard: (deckId, cardId) => {
        const deck = get().decks.find((d) => d.id === deckId);
        return deck?.cards.find((card) => card.id === cardId);
      }
    }),
    {
      name: 'flashcard-storage'
    }
  )
);