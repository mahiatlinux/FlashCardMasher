import React, { useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Layers, Settings, X, BrainCircuit } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFlashcardStore } from '../../store/useFlashcardStore';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { decks } = useFlashcardStore();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        closeSidebar();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeSidebar]);
  
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Create', href: '/create', icon: Layers },
    { name: 'Study', href: decks.length > 0 ? `/study` : '/dashboard', icon: BookOpen },
    { name: 'Settings', href: '/settings', icon: Settings }
  ];
  
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}
      
      <div
        ref={sidebarRef}
        className={cn(
          'fixed left-0 inset-y-0 z-30 w-64 flex-col bg-background-secondary border-r border-gray-800 transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:flex',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-lg bg-accent-primary/20 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-accent-primary" />
            </div>
            {/* Fix: No space between "FlashCard" and "Masher" */}
            <span className="text-lg font-bold">FlashCardMasher</span>
          </div>
          
          <button
            className="md:hidden p-2 rounded-lg hover:bg-background-tertiary"
            onClick={closeSidebar}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => cn(
                'flex items-center px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-accent-primary/20 text-accent-secondary'
                  : 'text-gray-300 hover:bg-background-tertiary hover:text-white'
              )}
              onClick={closeSidebar}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <div className="glass-effect rounded-lg p-4">
            {/* Fix: No space between "FlashCard" and "Masher" */}
            <p className="text-sm font-medium">FlashCardMasher</p>
            <p className="text-xs text-gray-400">Your study companion</p>
          </div>
        </div>
      </div>
    </>
  );
};