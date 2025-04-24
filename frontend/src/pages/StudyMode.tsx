import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, AlertTriangle, Check, X, Book, BarChart2, Clock, Tag } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { StudyFlashcard } from '../components/ui/StudyFlashcard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useFlashcardStore } from '../store/useFlashcardStore';
import { Flashcard, FlashcardDeck } from '../types';

export const StudyMode: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { getDeck, updateCardConfidence, recordStudySession, decks } = useFlashcardStore();
  
  // If deckId is provided, get that specific deck
  const deck = deckId ? getDeck(deckId) : null;
  
  // Track if the session has been initialized to prevent unnecessary resets
  const sessionInitializedRef = useRef<string | false>(false);
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  
  // Add state to track card transitions
  const [isCardChanging, setIsCardChanging] = useState(false);
  
  // Add loading state when switching decks
  const [isLoading, setIsLoading] = useState(false);
  
  // Study session stats
  const [stats, setStats] = useState({
    total: 0,
    correct: 0,
    incorrect: 0,
    skipped: 0,
    startTime: new Date(),
    endTime: null as Date | null
  });
  
  // Reset study session state - but only when explicitly called
  const resetStudySession = () => {
    setCurrentCardIndex(0);
    setIsComplete(false);
    setStats({
      total: deck?.cards.length || 0,
      correct: 0,
      incorrect: 0,
      skipped: 0,
      startTime: new Date(),
      endTime: null
    });
  };
  
  // Reset completion state immediately when URL changes
  useEffect(() => {
    // When the URL changes, reset completion state immediately
    setIsComplete(false);
    
    // If we're going to a specific deck, set loading state
    if (location.pathname.includes('/study/') && location.pathname !== `/study/${sessionInitializedRef.current}`) {
      setIsLoading(true);
      
      // Reset loading state after a short delay
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [location.pathname]);
  
  // Initialize study session if deck is present
  useEffect(() => {
    if (deck && deck.cards.length > 0) {
      // Only reset if the deck ID changed OR this is the first initialization
      if (!sessionInitializedRef.current || sessionInitializedRef.current !== deckId) {
        resetStudySession();
        setStudyCards(deck.cards);
        setStats(prev => ({
          ...prev,
          total: deck.cards.length
        }));
        
        // Mark this deck as initialized
        sessionInitializedRef.current = deckId;
      }
    }
  }, [deck, deckId]); 
  
  // If no deckId is provided, render deck selection
  if (!deckId) {
    // Clear session when viewing deck selection
    sessionInitializedRef.current = false;
    return <DeckSelectionView decks={decks} navigate={navigate} />;
  }
  
  if (!deck) {
    return (
      <div className="py-10 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-error-primary/10 border border-error-primary/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-error-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Deck Not Found</h1>
        <p className="text-gray-400 mb-6">The flashcard deck you're looking for doesn't exist</p>
        <Button 
          variant="primary"
          onClick={() => navigate('/dashboard')}
          className="border border-white/20"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  if (deck.cards.length === 0) {
    return (
      <div className="py-10 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-warning-primary/10 border border-warning-primary/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-warning-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Empty Deck</h1>
        <p className="text-gray-400 mb-6">This deck doesn't have any flashcards yet</p>
        <Button 
          variant="primary"
          onClick={() => navigate(`/decks/${deckId}`)}
          className="border border-white/20"
        >
          Add Cards
        </Button>
      </div>
    );
  }
  
  const currentCard = studyCards[currentCardIndex];
  
  const handleRateConfidence = (confidence: number) => {
    if (deckId && currentCard) {
      // Update the card's confidence rating
      updateCardConfidence(deckId, currentCard.id, confidence);
      
      // Update study stats
      setStats(prev => ({
        ...prev,
        correct: confidence >= 2 ? prev.correct + 1 : prev.correct,
        incorrect: confidence < 2 ? prev.incorrect + 1 : prev.incorrect
      }));
      
      // Advance to next card WITH blur transition
      handleNextCard();
    }
  };
  
  const handleNextCard = () => {
    if (currentCardIndex < studyCards.length - 1) {
      // Start the card transition with blur effect
      setIsCardChanging(true);
      
      // Use setTimeout to create a delay before changing the card
      setTimeout(() => {
        // Just increment the index without resetting anything
        setCurrentCardIndex(prevIndex => prevIndex + 1);
        
        // End the transition after a short delay to ensure smooth animation
        setTimeout(() => {
          setIsCardChanging(false);
        }, 150);
      }, 150);
    } else {
      // Only complete the session at the very end of the deck
      completeStudySession();
    }
  };
  
  const completeStudySession = () => {
    const endTime = new Date();
    setStats(prev => ({ ...prev, endTime }));
    setIsComplete(true);
    
    // Record the study session
    if (deckId) {
      recordStudySession(deckId, studyCards.map(card => card.id));
    }
  };
  
  const handleRestartSession = () => {
    // Explicitly reset the session only when user clicks "Study Again"
    resetStudySession();
  };

  // Navigate to study selection and reset state
  const navigateToStudySelection = () => {
    // Immediately reset completion state to prevent flashing
    setIsComplete(false);
    
    // Clear the initialization ref to ensure a fresh start when coming back
    sessionInitializedRef.current = false;
    
    // Then navigate to the study deck selection
    navigate('/study');
  };
  
  const formatStudyTime = () => {
    if (!stats.endTime) return '0 seconds';
    
    const diffMs = stats.endTime.getTime() - stats.startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    if (diffMins === 0) {
      return `${diffSecs} seconds`;
    } else if (diffMins === 1) {
      return `1 minute ${diffSecs} seconds`;
    } else {
      return `${diffMins} minutes ${diffSecs} seconds`;
    }
  };
  
  const renderSummary = () => (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <div className="w-20 h-20 rounded-full bg-success-primary/10 border border-success-primary/20 flex items-center justify-center mx-auto mb-4">
          <Check className="w-10 h-10 text-success-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Study Complete!</h1>
        <p className="text-gray-400">You've completed this study session</p>
      </div>
      
      <Card variant="modern" className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Session Summary</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-background-tertiary rounded-lg p-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Correct</p>
              <p className="text-2xl font-bold">{stats.correct} <span className="text-sm text-gray-400">/ {stats.total}</span></p>
              <div className="mt-2">
                <ProgressBar 
                  value={stats.correct} 
                  max={stats.total} 
                  variant="success" 
                  size="sm" 
                />
              </div>
            </div>
            
            <div className="bg-background-tertiary rounded-lg p-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Incorrect</p>
              <p className="text-2xl font-bold">{stats.incorrect} <span className="text-sm text-gray-400">/ {stats.total}</span></p>
              <div className="mt-2">
                <ProgressBar 
                  value={stats.incorrect} 
                  max={stats.total} 
                  variant="error" 
                  size="sm" 
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background-tertiary rounded-lg p-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Accuracy</p>
              <p className="text-2xl font-bold">
                {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
              </p>
            </div>
            
            <div className="bg-background-tertiary rounded-lg p-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Time Spent</p>
              <p className="text-2xl font-bold">
                {formatStudyTime()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          leftIcon={<ChevronLeft className="w-5 h-5" />}
          onClick={() => navigate(`/decks/${deckId}`)}
          className="border border-white/20"
        >
          Back to Deck
        </Button>
        
        <Button
          variant="primary"
          onClick={handleRestartSession}
          className="border border-white/20"
        >
          Study Again
        </Button>
      </div>
      
      <div className="flex justify-center mt-6">
        <Button
          variant="secondary"
          onClick={navigateToStudySelection}
          className="border border-white/20"
        >
          Study Different Deck
        </Button>
      </div>
    </div>
  );
  
  const renderStudyMode = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button 
          className="flex items-center text-gray-400 hover:text-white transition-colors"
          onClick={() => navigate(`/decks/${deckId}`)}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Deck
        </button>
        
        <div className="flex items-center">
          <span className="text-sm">
            Card {currentCardIndex + 1} of {studyCards.length}
          </span>
          <div className="ml-4 w-32">
            <ProgressBar 
              value={currentCardIndex + 1} 
              max={studyCards.length} 
              size="sm" 
            />
          </div>
        </div>
      </div>
      
      <div className={`transition-all duration-300 ${isCardChanging ? 'opacity-0 blur-md' : 'opacity-100 blur-0'}`}>
        {currentCard && (
          <StudyFlashcard
            key={currentCardIndex} // Add key to force re-render on card change
            card={currentCard}
            onRateConfidence={handleRateConfidence}
            onNext={handleNextCard}
            isChanging={isCardChanging}
          />
        )}
      </div>
      
      <div className="mt-6 text-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={navigateToStudySelection}
          className="border border-white/20"
        >
          Switch Deck
        </Button>
      </div>
    </div>
  );
  
  // Show loading indicator when switching decks
  if (isLoading) {
    return (
      <div className="py-4">
        <h1 className="text-2xl font-bold mb-6 text-center">{deck.name}</h1>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-4">
      <h1 className="text-2xl font-bold mb-6 text-center">{deck.name}</h1>
      
      {isComplete ? renderSummary() : renderStudyMode()}
    </div>
  );
};

// Deck Selection View Component
const DeckSelectionView: React.FC<{ decks: FlashcardDeck[], navigate: (path: string) => void }> = ({ decks, navigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter decks based on search query
  const filteredDecks = decks.filter(deck => 
    deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Sort decks: decks with cards first, then alphabetically
  const sortedDecks = [...filteredDecks].sort((a, b) => {
    // First prioritize decks with cards
    if (a.cards.length > 0 && b.cards.length === 0) return -1;
    if (a.cards.length === 0 && b.cards.length > 0) return 1;
    
    // Then sort alphabetically
    return a.name.localeCompare(b.name);
  });
  
  return (
    <div className="py-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Study Mode</h1>
        <p className="text-gray-400">Select a deck to start studying</p>
      </div>
      
      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Search decks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-background-tertiary text-white rounded-lg border border-white/20 py-2 px-4 placeholder-gray-500 focus:outline-none focus:border-accent-primary"
        />
      </div>
      
      {sortedDecks.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-background-tertiary border border-white/20 flex items-center justify-center mx-auto mb-4">
            <Book className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">No Flashcard Decks</h2>
          <p className="text-gray-400 mb-6">
            {searchQuery ? 'No decks match your search query' : 'Create your first flashcard deck to get started'}
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/create')}
            className="border border-white/20"
          >
            Create Deck
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 max-w-2xl mx-auto">
          {sortedDecks.map(deck => (
            <div 
              key={deck.id} 
              className={`rounded-lg bg-background-secondary border border-white/20 transition-all hover:shadow-md hover:border-white/30 cursor-pointer overflow-hidden ${
                deck.cards.length === 0 ? 'opacity-60' : ''
              }`}
              onClick={() => {
                // Clicking the card now navigates to view the deck
                navigate(`/decks/${deck.id}`);
              }}
            >
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{deck.name}</h3>
                  <p className="text-sm text-gray-400 line-clamp-1">{deck.description || 'No description'}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {deck.tags.slice(0, 2).map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-white/5 text-accent-secondary border border-white/20"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {deck.tags.length > 2 && (
                      <span className="text-xs text-gray-400">
                        +{deck.tags.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <Book className="w-4 h-4 mr-1" />
                    {deck.cards.length} cards
                  </div>
                  
                  {deck.cards.length > 0 ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Stop event from bubbling to the card
                          navigate(`/decks/${deck.id}`);
                        }}
                        className="border border-white/20"
                      >
                        View Deck
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Stop event from bubbling to the card
                          navigate(`/study/${deck.id}`);
                        }}
                        className="border border-white/20"
                      >
                        Study Now
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Stop event from bubbling to the card
                        navigate(`/decks/${deck.id}`);
                      }}
                      className="border border-white/20"
                    >
                      Add Cards
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Button
          variant="outline"
          leftIcon={<ChevronLeft className="w-5 h-5" />}
          onClick={() => navigate('/dashboard')}
          className="border border-white/20"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};