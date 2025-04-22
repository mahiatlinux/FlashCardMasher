import React from 'react';
import { Menu, Plus, Search, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useThemeStore } from '../../store/useThemeStore';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  
  return (
    <header className="bg-background-secondary border-b border-gray-800 py-4 px-4 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-background-tertiary mr-2"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="relative hidden md:flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search flashcards..." 
              className="bg-background-tertiary pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-accent-primary text-sm w-64"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Fix for theme toggle - ensure it's calling the function correctly
              toggleTheme();
              // Force a document class update to ensure theme changes apply
              document.documentElement.className = theme === 'dark' ? 'light' : 'dark';
            }}
            className="mr-2"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/create')}
          >
            Create Cards
          </Button>
        </div>
      </div>
    </header>
  );
};