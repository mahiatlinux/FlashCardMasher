import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Book, Clock, Calendar, Search, Tag, MoreVertical, Trash, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useFlashcardStore } from '../store/useFlashcardStore';
import { FlashcardDeck } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { decks, deleteDeck } = useFlashcardStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deckMenuOpen, setDeckMenuOpen] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  
  // Filter decks based on search query
  const filteredDecks = decks.filter(deck => 
    deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Toggle deck menu
  const toggleDeckMenu = (deckId: string) => {
    if (deckMenuOpen === deckId) {
      setDeckMenuOpen(null);
    } else {
      setDeckMenuOpen(deckId);
    }
  };
  
  // Initiate deck deletion confirmation
  const confirmDeleteDeck = (deckId: string) => {
    setDeleteConfirmation(deckId);
    setDeckMenuOpen(null);
  };
  
  // Cancel deletion
  const cancelDeleteDeck = () => {
    setDeleteConfirmation(null);
  };
  
  // Perform actual deletion
  const handleDeleteDeck = (deckId: string) => {
    deleteDeck(deckId);
    setDeleteConfirmation(null);
  };
  
  // Close menu when clicking outside
  const closeAllMenus = () => {
    setDeckMenuOpen(null);
  };
  
  return (
    <div className="py-4" onClick={closeAllMenus}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Flashcards</h1>
          <p className="text-gray-400">Manage and study your flashcard decks</p>
        </div>
        
        <div className="flex flex-col sm:flex-row mt-4 md:mt-0 gap-4 w-full md:w-auto">
          <Input
            placeholder="Search decks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="w-full sm:w-64"
          />
          
          <Button
            variant="primary"
            onClick={() => navigate('/create')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Deck
          </Button>
        </div>
      </div>
      
      {filteredDecks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mx-auto mb-4">
            <Book className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">No Flashcard Decks</h2>
          <p className="text-gray-400 mb-6">
            {searchQuery ? 'No decks match your search query' : 'Create your first flashcard deck to get started'}
          </p>
          {!searchQuery && (
            <Button
              variant="primary"
              onClick={() => navigate('/create')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Deck
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map(deck => (
            <div key={deck.id} className="relative">
              {deleteConfirmation === deck.id ? (
                <Card variant="neomorphic" className="border-error-primary bg-background-tertiary/80">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-error-primary/20 flex items-center justify-center mx-auto mb-4">
                        <Trash className="w-6 h-6 text-error-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Delete Deck?</h3>
                      <p className="text-gray-400 mb-6">
                        Are you sure you want to delete "{deck.name}"? This action cannot be undone.
                      </p>
                      <div className="flex justify-center gap-4">
                        <Button
                          variant="outline"
                          onClick={cancelDeleteDeck}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="error"
                          onClick={() => handleDeleteDeck(deck.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card 
                  variant="neomorphic" 
                  className="h-full transition-all hover:shadow-neomorphic-lg cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/decks/${deck.id}`);
                  }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="truncate">{deck.name}</CardTitle>
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="p-2 hover:bg-background-tertiary rounded-full text-gray-400 hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDeckMenu(deck.id);
                          }}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {deckMenuOpen === deck.id && (
                          <div 
                            className="absolute right-0 top-10 z-10 bg-background-secondary shadow-neomorphic rounded-lg overflow-hidden w-48"
                          >
                            <div className="py-1">
                              <Link 
                                to={`/decks/${deck.id}`}
                                className="flex items-center px-4 py-2 text-sm hover:bg-background-tertiary w-full text-left"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Deck
                              </Link>
                              <button 
                                className="flex items-center px-4 py-2 text-sm hover:bg-background-tertiary w-full text-left text-error-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDeleteDeck(deck.id);
                                }}
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete Deck
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-400 line-clamp-2 mb-4">
                      {deck.description || 'No description'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {deck.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent-primary/20 text-accent-secondary"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {deck.tags.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{deck.tags.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex items-center text-sm text-gray-400">
                        <Book className="w-4 h-4 mr-1" />
                        {deck.cards.length} cards
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(deck.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/study/${deck.id}`);
                        }}
                      >
                        Study Now
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/decks/${deck.id}`);
                        }}
                      >
                        View Deck
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};