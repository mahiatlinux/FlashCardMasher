// src/services/api.ts
import axios from 'axios';
import { GenerationOptions, Flashcard } from '../types';

// Get API URL from Vite environment variables or fallback to window.ENV
const getApiBaseUrl = () => {
  // First try Vite's import.meta.env (available during build time)
  try {
    if (import.meta.env && import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
  } catch (e) {
    // Ignore errors when import.meta is not available
  }
  
  // Fallback to window.ENV (set in public/env.js)
  if (typeof window !== 'undefined' && window.ENV && window.ENV.VITE_API_URL) {
    return window.ENV.VITE_API_URL;
  }
  
  // Hardcoded fallback
  return 'http://localhost:5000/api';
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Generate flashcards from text input
 */
export const generateFlashcardsFromText = async (
  text: string,
  options: GenerationOptions
): Promise<Flashcard[]> => {
  try {
    const response = await api.post('/flashcards/generate-from-text', {
      text,
      options,
    });
    return response.data.flashcards;
  } catch (error) {
    console.error('Error generating flashcards from text:', error);
    throw error;
  }
};

/**
 * Generate flashcards from file upload
 */
export const generateFlashcardsFromFile = async (
  file: File,
  options: GenerationOptions
): Promise<Flashcard[]> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));
    
    const response = await api.post('/flashcards/generate-from-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.flashcards;
  } catch (error) {
    console.error('Error generating flashcards from file:', error);
    throw error;
  }
};

/**
 * Generate flashcards from URL
 */
export const generateFlashcardsFromURL = async (
  url: string,
  options: GenerationOptions
): Promise<Flashcard[]> => {
  try {
    const response = await api.post('/flashcards/generate-from-url', {
      url,
      options,
    });
    return response.data.flashcards;
  } catch (error) {
    console.error('Error generating flashcards from URL:', error);
    throw error;
  }
};

/**
 * Check if the API server is healthy
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.data.status === 'healthy';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default {
  generateFlashcardsFromText,
  generateFlashcardsFromFile,
  generateFlashcardsFromURL,
  checkApiHealth,
};