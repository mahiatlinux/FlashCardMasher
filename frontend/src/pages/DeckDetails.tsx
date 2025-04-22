import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Trash, 
  Plus, 
  Save, 
  X, 
  BookOpen, 
  Tag, 
  AlertTriangle,
  Search,
  SlidersHorizontal,
  Download,
  Upload
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { FlashcardPreview } from '../components/ui/FlashcardPreview';
import { useFlashcardStore } from '../store/useFlashcardStore';
import { Flashcard, DifficultyLevel } from '../types';

export const DeckDetails: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  
  // File input ref for importing cards
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    getDeck, 
    updateDeck, 
    deleteDeck,
    addCard,
    updateCard,
    deleteCard 
  } = useFlashcardStore();
  
  const deck = getDeck(deckId || '');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(deck?.name || '');
  const [editDescription, setEditDescription] = useState(deck?.description || '');
  
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [newCardTags, setNewCardTags] = useState('');
  const [newCardDifficulty, setNewCardDifficulty] = useState<DifficultyLevel>('medium');
  
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editCardFront, setEditCardFront] = useState('');
  const [editCardBack, setEditCardBack] = useState('');
  const [editCardTags, setEditCardTags] = useState('');
  const [editCardDifficulty, setEditCardDifficulty] = useState<DifficultyLevel>('medium');
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Handler for downloading deck
  const handleDownloadDeck = () => {
    if (!deck) return;
    
    // Create a JSON file with the deck contents
    const deckData = JSON.stringify(deck, null, 2);
    const blob = new Blob([deckData], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${deck.name.replace(/\s+/g, '-').toLowerCase()}-flashcards.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // New handlers for importing cards
  const handleImportCards = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !deckId) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        
        // There are several possible formats, so we need to handle different cases
        
        // Case 1: The file is a full deck export including cards array
        if (jsonData.cards && Array.isArray(jsonData.cards)) {
          // Confirm with the user if they want to import these cards
          const importCount = jsonData.cards.length;
          if (window.confirm(`Import ${importCount} cards from this file?`)) {
            // Add each card to the deck
            jsonData.cards.forEach((card: any) => {
              // Extract relevant card data
              const front = card.front || '';
              const back = card.back || '';
              const tags = card.tags || [];
              const difficulty = card.difficulty || 'medium';
              
              // Only add if front and back are not empty
              if (front && back) {
                addCard(deckId, front, back, tags, difficulty as DifficultyLevel);
              }
            });
            
            alert(`Successfully imported ${importCount} cards.`);
          }
        }
        
        // Case 2: The file is an array of cards
        else if (Array.isArray(jsonData)) {
          // Confirm with the user
          const importCount = jsonData.length;
          if (window.confirm(`Import ${importCount} cards from this file?`)) {
            // Add each card to the deck
            jsonData.forEach((card: any) => {
              const front = card.front || '';
              const back = card.back || '';
              const tags = card.tags || [];
              const difficulty = card.difficulty || 'medium';
              
              if (front && back) {
                addCard(deckId, front, back, tags, difficulty as DifficultyLevel);
              }
            });
            
            alert(`Successfully imported ${importCount} cards.`);
          }
        }
        
        // Case 3: Simple format with just questions and answers
        else if (jsonData.questions && jsonData.answers && 
                Array.isArray(jsonData.questions) && 
                Array.isArray(jsonData.answers) &&
                jsonData.questions.length === jsonData.answers.length) {
          
          const importCount = jsonData.questions.length;
          if (window.confirm(`Import ${importCount} cards from this file?`)) {
            for (let i = 0; i < jsonData.questions.length; i++) {
              const front = jsonData.questions[i];
              const back = jsonData.answers[i];
              
              if (front && back) {
                addCard(deckId, front, back, [], 'medium');
              }
            }
            
            alert(`Successfully imported ${importCount} cards.`);
          }
        }
        
        // No valid format detected
        else {
          alert('The file format is not recognized. Please use a valid flashcard export file.');
        }
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert('Error importing cards. Please make sure the file contains valid JSON.');
      }
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.onerror = () => {
      alert('Error reading the file. Please try again.');
    };
    
    reader.readAsText(file);
  };
  
  if (!deck) {
    return (
      <div className="py-10 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-error-primary/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-error-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Deck Not Found</h1>
        <p className="text-gray-400 mb-6">The flashcard deck you're looking for doesn't exist</p>
        <Button 
          variant="primary"
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  const handleSaveEdit = () => {
    if (deckId) {
      updateDeck(deckId, {
        name: editName,
        description: editDescription
      });
      setIsEditing(false);
    }
  };
  
  const handleDeleteDeck = () => {
    if (window.confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
      if (deckId) {
        deleteDeck(deckId);
        navigate('/dashboard');
      }
    }
  };
  
  const handleAddCard = () => {
    if (deckId && newCardFront && newCardBack) {
      const tags = newCardTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      
      addCard(deckId, newCardFront, newCardBack, tags, newCardDifficulty);
      
      // Reset form
      setNewCardFront('');
      setNewCardBack('');
      setNewCardTags('');
      setNewCardDifficulty('medium');
      setIsAddingCard(false);
    }
  };
  
  const handleEditCard = (card: Flashcard) => {
    setEditingCardId(card.id);
    setEditCardFront(card.front);
    setEditCardBack(card.back);
    setEditCardTags(card.tags.join(', '));
    setEditCardDifficulty(card.difficulty);
  };
  
  const handleSaveCardEdit = () => {
    if (deckId && editingCardId) {
      const tags = editCardTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      
      updateCard(deckId, editingCardId, {
        front: editCardFront,
        back: editCardBack,
        tags,
        difficulty: editCardDifficulty
      });
      
      setEditingCardId(null);
    }
  };
  
  const handleDeleteCard = (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      if (deckId) {
        deleteCard(deckId, cardId);
      }
    }
  };
  
  // Filter cards based on search query
  const filteredCards = deck.cards.filter(card => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      card.front.toLowerCase().includes(query) ||
      card.back.toLowerCase().includes(query) ||
      card.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });
  
  const difficultyOptions: {value: DifficultyLevel, label: string}[] = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
    { value: 'expert', label: 'Expert' }
  ];
  
  return (
    <div>
      {/* Hidden file input for importing */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        {isEditing ? (
          <div className="w-full md:w-2/3">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Deck name"
              className="text-2xl font-bold mb-2"
              fullWidth
            />
            <TextArea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
              className="text-gray-400"
              fullWidth
            />
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold mb-1">{deck.name}</h1>
            <p className="text-gray-400">{deck.description}</p>
          </div>
        )}
        
        <div className="flex flex-wrap space-x-2 mt-4 md:mt-0">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                leftIcon={<X className="w-4 h-4" />}
                onClick={() => setIsEditing(false)}
                className="mb-2"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                leftIcon={<Save className="w-4 h-4" />}
                onClick={handleSaveEdit}
                className="mb-2"
              >
                Save
              </Button>
            </>
          ) : (
            <>
              {/* Import button - NEW */}
              <Button
                variant="outline"
                leftIcon={<Upload className="w-4 h-4" />}
                onClick={handleImportCards}
                className="mb-2"
              >
                Import
              </Button>
              
              {/* Download button */}
              <Button
                variant="outline"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleDownloadDeck}
                className="mb-2"
              >
                Download
              </Button>
              
              <Button
                variant="outline"
                leftIcon={<Edit className="w-4 h-4" />}
                onClick={() => setIsEditing(true)}
                className="mb-2"
              >
                Edit
              </Button>
              <Button
                variant="danger"
                leftIcon={<Trash className="w-4 h-4" />}
                onClick={handleDeleteDeck}
                className="mb-2"
              >
                Delete
              </Button>
              <Button
                variant="primary"
                leftIcon={<BookOpen className="w-4 h-4" />}
                onClick={() => navigate(`/study/${deckId}`)}
                className="mb-2"
              >
                Study
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center mb-3 md:mb-0">
          <div className="bg-background-secondary px-3 py-1 rounded-full text-sm">
            {deck.cards.length} {deck.cards.length === 1 ? 'card' : 'cards'}
          </div>
          {deck.tags.length > 0 && (
            <div className="flex ml-3">
              {deck.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent-primary/20 text-accent-secondary"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
              {deck.tags.length > 3 && (
                <span className="ml-2 px-2 py-1 rounded-full text-xs bg-gray-700">
                  +{deck.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex w-full md:w-auto space-x-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background-tertiary pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-accent-primary text-sm w-full"
            />
          </div>
          
          <Button
            variant="outline"
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          >
            Sort
          </Button>
          
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddingCard(true)}
          >
            Add Card
          </Button>
        </div>
      </div>
      
      {isAddingCard && (
        <Card variant="default" className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Card</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsAddingCard(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <TextArea
                  label="Front Side"
                  value={newCardFront}
                  onChange={(e) => setNewCardFront(e.target.value)}
                  placeholder="Question or term"
                  fullWidth
                />
              </div>
              <div>
                <TextArea
                  label="Back Side"
                  value={newCardBack}
                  onChange={(e) => setNewCardBack(e.target.value)}
                  placeholder="Answer or definition"
                  fullWidth
                />
              </div>
              <div>
                <Input
                  label="Tags (comma separated)"
                  value={newCardTags}
                  onChange={(e) => setNewCardTags(e.target.value)}
                  placeholder="history, science, etc."
                  fullWidth
                  leftIcon={<Tag className="w-4 h-4" />}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty
                </label>
                {/* Responsive difficulty buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {difficultyOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`py-2 px-1 rounded-lg text-sm whitespace-nowrap overflow-hidden text-ellipsis transition-colors ${
                        newCardDifficulty === option.value
                          ? 'bg-accent-primary text-white'
                          : 'bg-background-tertiary text-gray-300 hover:bg-background-tertiary/80'
                      }`}
                      onClick={() => setNewCardDifficulty(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setIsAddingCard(false)}
                className="mr-3"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddCard}
                disabled={!newCardFront || !newCardBack}
              >
                Add Card
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.length === 0 ? (
          <div className="col-span-full py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No cards found</h3>
            <p className="text-gray-400">
              {searchQuery 
                ? `No cards match your search query "${searchQuery}"`
                : 'This deck is empty. Add your first card to get started.'}
            </p>
          </div>
        ) : (
          filteredCards.map((card) => (
            <div key={card.id}>
              {editingCardId === card.id ? (
                <Card variant="default">
                  <CardContent className="p-4">
                    <div className="mb-4">
                      <TextArea
                        label="Front Side"
                        value={editCardFront}
                        onChange={(e) => setEditCardFront(e.target.value)}
                        fullWidth
                      />
                    </div>
                    <div className="mb-4">
                      <TextArea
                        label="Back Side"
                        value={editCardBack}
                        onChange={(e) => setEditCardBack(e.target.value)}
                        fullWidth
                      />
                    </div>
                    <div className="mb-4">
                      <Input
                        label="Tags"
                        value={editCardTags}
                        onChange={(e) => setEditCardTags(e.target.value)}
                        fullWidth
                        leftIcon={<Tag className="w-4 h-4" />}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Difficulty
                      </label>
                      {/* Responsive difficulty buttons in edit mode */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {difficultyOptions.map((option) => (
                          <button
                            key={option.value}
                            className={`py-2 px-1 rounded-lg text-sm whitespace-nowrap overflow-hidden text-ellipsis transition-colors ${
                              editCardDifficulty === option.value
                                ? 'bg-accent-primary text-white'
                                : 'bg-background-tertiary text-gray-300 hover:bg-background-tertiary/80'
                            }`}
                            onClick={() => setEditCardDifficulty(option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCardId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveCardEdit}
                      >
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <FlashcardPreview
                  card={card}
                  onEdit={() => handleEditCard(card)}
                  onDelete={() => handleDeleteCard(card.id)}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};