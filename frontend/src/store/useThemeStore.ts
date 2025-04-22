import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => {
        set((state) => {
          // Get the new theme based on current state
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          
          // Apply theme to document element immediately
          document.documentElement.className = newTheme;
          
          // Return new state
          return { theme: newTheme };
        });
      },
      setTheme: (theme: Theme) => {
        // Apply theme to document element immediately
        document.documentElement.className = theme;
        
        // Update state
        set({ theme });
      }
    }),
    {
      name: 'theme-storage',
    }
  )
);