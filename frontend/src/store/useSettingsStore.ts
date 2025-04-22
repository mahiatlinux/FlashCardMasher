import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  cardsPerStudySession: number;
  spaceRepetitionEnabled: boolean;
  autoSaveEnabled: boolean;
  notificationsEnabled: boolean;
  exportFormat: 'json' | 'csv' | 'anki' | 'quizlet';
}

interface SettingsState {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  cardsPerStudySession: 20,
  spaceRepetitionEnabled: true,
  autoSaveEnabled: true,
  notificationsEnabled: true,
  exportFormat: 'json'
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) => 
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }))
    }),
    {
      name: 'settings-storage'
    }
  )
);