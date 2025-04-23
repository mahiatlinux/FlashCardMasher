import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flashcard, DifficultyLevel } from '../../types';
import { Button } from './Button';
import { cn } from '../../utils/cn';

interface StudyFlashcardProps {
  card: Flashcard;
  onRateConfidence: (confidence: number) => void;
  onNext: () => void;
}

export const StudyFlashcard: React.FC<StudyFlashcardProps> = ({
  card,
  onRateConfidence,
  onNext,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleRateConfidence = (confidence: number) => {
    onRateConfidence(confidence);
    setIsFlipped(false);
    // Removed the onNext() call here because onRateConfidence already handles advancing to the next card
  };
  
  // Confidence labels and colors
  const confidenceOptions = [
    { value: 0, label: "Don't know", color: 'bg-error-primary hover:bg-error-secondary' },
    { value: 1, label: "Hard", color: 'bg-warning-primary hover:bg-warning-secondary' },
    { value: 2, label: "Good", color: 'bg-accent-primary hover:bg-accent-secondary' },
    { value: 3, label: "Easy", color: 'bg-success-primary hover:bg-success-secondary' },
  ];
  
  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        className="flip-container w-full h-96 mb-6 cursor-pointer"
        onClick={handleFlip}
      >
        <div className={`card-inner relative w-full h-full ${isFlipped ? 'flipped' : ''}`}>
          <div className="card-front absolute w-full h-full rounded-xl bg-background-secondary border border-gray-700 p-6 flex flex-col shadow-neomorphic">
            <div className="flex-1 flex flex-col items-center justify-center">
              <span className={cn(
                "px-3 py-1 rounded-full text-sm mb-6",
                card.difficulty === 'easy' && "bg-success-primary/20 text-success-secondary",
                card.difficulty === 'medium' && "bg-warning-primary/20 text-warning-secondary",
                card.difficulty === 'hard' && "bg-error-primary/20 text-error-secondary",
                card.difficulty === 'expert' && "bg-error-primary/20 text-error-secondary"
              )}>
                {card.difficulty}
              </span>
              <h3 className="text-2xl font-bold text-center mb-2">{card.front}</h3>
              <p className="text-gray-400 text-center mt-4">Tap to reveal answer</p>
            </div>
          </div>
          
          <div className="card-back absolute w-full h-full rounded-xl bg-background-secondary border border-gray-700 p-6 flex flex-col shadow-neomorphic">
            <div className="flex-1 flex flex-col items-center justify-center">
              <h4 className="text-xl font-semibold text-gray-400 mb-4">{card.front}</h4>
              <div className="w-full h-px bg-gray-700 mb-6"></div>
              <p className="text-xl text-center">{card.back}</p>
            </div>
            
            <div className="mt-4">
              <p className="text-center text-gray-400 mb-4">How well did you know this?</p>
              <div className="grid grid-cols-4 gap-2">
                {confidenceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRateConfidence(option.value);
                    }}
                    className={cn(
                      "py-2 px-2 rounded-lg text-white text-sm font-medium transition-colors",
                      option.color
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};