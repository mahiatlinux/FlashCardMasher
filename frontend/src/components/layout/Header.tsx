import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();  
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
        </div>
        
        <div className="flex items-center space-x-2">
          
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
