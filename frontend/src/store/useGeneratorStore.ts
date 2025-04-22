// src/store/useGeneratorStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { InputFormat, GenerationOptions, DifficultyLevel, ProcessingState } from '../types';
import { useFlashcardStore } from './useFlashcardStore';
import * as api from '../services/api';

// File upload type
interface FileUpload {
  id: string;
  file: File;
  name: string;
  progress: number;
  error?: string;
}

// Generator store state
interface GeneratorState {
  // Input
  inputText: string;
  inputFormat: InputFormat;
  fileUploads: FileUpload[];
  inputUrl: string;
  
  // Options
  generationOptions: GenerationOptions;
  
  // Processing state
  processingState: ProcessingState;
  
  // Actions
  setInputText: (text: string) => void;
  setInputFormat: (format: InputFormat) => void;
  setInputUrl: (url: string) => void;
  addFileUpload: (file: File) => Promise<void>;
  removeFileUpload: (id: string) => void;
  setGenerationOptions: (options: Partial<GenerationOptions>) => void;
  generateFlashcards: (deckId: string) => Promise<void>;
  resetState: () => void;
}

// Create store
export const useGeneratorStore = create<GeneratorState>((set, get) => ({
  // Input
  inputText: '',
  inputFormat: 'text',
  fileUploads: [],
  inputUrl: '',
  
  // Options
  generationOptions: {
    cardCount: 10,
    difficulty: 'medium',
    termDefinition: true,
    questionAnswer: false,
  },
  
  // Processing state
  processingState: {
    status: 'idle',
    progress: 0,
    message: '',
    error: null,
  },
  
  // Actions
  setInputText: (text) => set({ inputText: text }),
  
  setInputFormat: (format) => set({ inputFormat: format }),
  
  setInputUrl: (url) => set({ inputUrl: url }),
  
  addFileUpload: async (file) => {
    const id = uuidv4();
    const fileUpload: FileUpload = {
      id,
      file,
      name: file.name,
      progress: 0,
    };
    
    set((state) => ({
      fileUploads: [...state.fileUploads, fileUpload],
    }));
    
    // Simulate progress for UI feedback
    const interval = setInterval(() => {
      set((state) => {
        const uploads = state.fileUploads.map((upload) => {
          if (upload.id === id && upload.progress < 100) {
            return { ...upload, progress: upload.progress + 10 };
          }
          return upload;
        });
        
        return { fileUploads: uploads };
      });
    }, 200);
    
    // Stop progress after 2 seconds
    setTimeout(() => {
      clearInterval(interval);
      set((state) => {
        const uploads = state.fileUploads.map((upload) => {
          if (upload.id === id) {
            return { ...upload, progress: 100 };
          }
          return upload;
        });
        
        return { fileUploads: uploads };
      });
    }, 2000);
  },
  
  removeFileUpload: (id) => {
    set((state) => ({
      fileUploads: state.fileUploads.filter((upload) => upload.id !== id),
    }));
  },
  
  setGenerationOptions: (options) => {
    set((state) => ({
      generationOptions: {
        ...state.generationOptions,
        ...options,
      },
    }));
  },
  
  generateFlashcards: async (deckId) => {
    const { inputFormat, inputText, fileUploads, inputUrl, generationOptions } = get();
    // Get the addCard function from the flashcard store
    const { addCard } = useFlashcardStore.getState();
    
    // Update processing state
    set({
      processingState: {
        status: 'processing',
        progress: 0,
        message: 'Starting the generation process...',
        error: null,
      },
    });
    
    try {
      // Update progress
      set((state) => ({
        processingState: {
          ...state.processingState,
          progress: 25,
          message: 'Analyzing content...',
        },
      }));
      
      // Generate flashcards based on input format
      let flashcards;
      
      if (inputFormat === 'text' && inputText.trim()) {
        // Update progress
        set((state) => ({
          processingState: {
            ...state.processingState,
            progress: 50,
            message: 'Extracting key concepts...',
          },
        }));
        
        flashcards = await api.generateFlashcardsFromText(inputText, generationOptions);
      } else if ((inputFormat === 'pdf' || inputFormat === 'docx') && fileUploads.length > 0) {
        // Update progress
        set((state) => ({
          processingState: {
            ...state.processingState,
            progress: 50,
            message: 'Processing file and extracting content...',
          },
        }));
        
        flashcards = await api.generateFlashcardsFromFile(fileUploads[0].file, generationOptions);
      } else if (inputFormat === 'url' && inputUrl.trim()) {
        // Update progress
        set((state) => ({
          processingState: {
            ...state.processingState,
            progress: 50,
            message: 'Fetching content from URL...',
          },
        }));
        
        flashcards = await api.generateFlashcardsFromURL(inputUrl, generationOptions);
      } else {
        throw new Error('Invalid input. Please provide text content or upload a file.');
      }
      
      // Update progress
      set((state) => ({
        processingState: {
          ...state.processingState,
          progress: 75,
          message: 'Adding flashcards to your deck...',
        },
      }));
      
      // Add flashcards to the deck
      if (flashcards && Array.isArray(flashcards)) {
        // Add each card individually using addCard function
        for (const card of flashcards) {
          addCard(
            deckId,
            card.front,
            card.back,
            card.tags || [],
            card.difficulty
          );
        }
        
        // Update progress
        set({
          processingState: {
            status: 'success',
            progress: 100,
            message: `Successfully generated ${flashcards.length} flashcards!`,
            error: null,
          },
        });
      } else {
        throw new Error('Failed to generate flashcards. Invalid response format.');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      
      // Update error state
      set({
        processingState: {
          status: 'error',
          progress: 0,
          message: '',
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      });
    }
  },
  
  resetState: () => {
    set({
      inputText: '',
      inputFormat: 'text',
      fileUploads: [],
      inputUrl: '',
      processingState: {
        status: 'idle',
        progress: 0,
        message: '',
        error: null,
      },
    });
  },
}));