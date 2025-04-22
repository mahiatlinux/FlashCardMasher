import React, { useState } from 'react';
import { Flashcard } from '../../types';
import { motion } from 'framer-motion';
import { MessageCircle, Edit, Trash, Tag } from 'lucide-react';

interface FlashcardPreviewProps {
  card: Flashcard;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const FlashcardPreview: React.FC<FlashcardPreviewProps> = ({
  card,
  onEdit,
  onDelete
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  // Set difficulty badge color
  const difficultyColor = {
    easy: 'bg-success-primary/20 text-success-secondary',
    medium: 'bg-warning-primary/20 text-warning-secondary',
    hard: 'bg-error-primary/20 text-error-secondary',
    expert: 'bg-error-primary/20 text-error-secondary',
  };
  
  return (
    <div 
      className="flip-container w-full h-64 cursor-pointer"
      onClick={handleFlip}
    >
      <div className={`card-inner relative w-full h-full ${isFlipped ? 'flipped' : ''}`}>
        <div className="card-front absolute w-full h-full rounded-xl bg-background-secondary border border-gray-700 p-5 flex flex-col shadow-neomorphic-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="flex space-x-2">
              {card.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent-primary/20 text-accent-secondary"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${difficultyColor[card.difficulty]}`}>
              {card.difficulty}
            </span>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <h3 className="text-xl font-semibold text-center">{card.front}</h3>
          </div>
          
          <div className="mt-auto flex justify-between items-center text-gray-400 text-sm">
            <span className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              Tap to flip
            </span>
            
            {onEdit && onDelete && (
              <div className="flex space-x-2">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1 hover:text-accent-primary"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-1 hover:text-error-primary"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="card-back absolute w-full h-full rounded-xl bg-background-secondary border border-gray-700 p-5 flex flex-col shadow-neomorphic-sm">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-center">{card.back}</p>
          </div>
          
          <div className="mt-auto flex justify-center items-center text-gray-400 text-sm">
            <span className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              Tap to flip back
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};