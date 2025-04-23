import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Book, Clock, Calendar, Search, Tag, MoreVertical, Trash, Edit,
  BarChart2, Clock as ClockIcon, Award, Activity, Brain, CheckCircle, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useFlashcardStore } from '../store/useFlashcardStore';
import { FlashcardDeck } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { decks, deleteDeck } = useFlashcardStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deckMenuOpen, setDeckMenuOpen] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'decks'>('overview');

  // Auto-switch to "decks" tab when searching
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      setActiveTab('decks');
    }
  }, [searchQuery]);

  // Filter decks based on search query
  const filteredDecks = decks.filter(deck => 
    deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Calculate study statistics
  const studyStats = useMemo(() => {
    // All cards that have been studied (have lastStudied date)
    const studiedCards = decks.flatMap(deck => 
      deck.cards.filter(card => card.lastStudied)
    );
    
    // Recently studied decks (sorted by most recent study date)
    const recentDecks = [...decks]
      .filter(deck => deck.lastStudied)
      .sort((a, b) => {
        const dateA = a.lastStudied ? new Date(a.lastStudied).getTime() : 0;
        const dateB = b.lastStudied ? new Date(b.lastStudied).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 3);
    
    // Calculate average accuracy (based on confidence scores: 0-1 incorrect, 2-3 correct)
    const totalCards = studiedCards.length;
    const correctCards = studiedCards.filter(card => card.confidence >= 2).length;
    const averageAccuracy = totalCards > 0 ? (correctCards / totalCards) * 100 : 0;
    
    // Calculate total study time (estimate based on 30 seconds per card)
    const totalStudyTimeMinutes = Math.ceil(studiedCards.length * 0.5);
    
    // Generate accuracy data for chart (last 7 days)
    const now = new Date();
    const accuracyData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      // Find cards studied on this day
      const dayCards = studiedCards.filter(card => {
        if (!card.lastStudied) return false;
        const studyDate = new Date(card.lastStudied);
        return studyDate >= date && studyDate < nextDate;
      });
      
      const dayCorrect = dayCards.filter(card => card.confidence >= 2).length;
      const dayAccuracy = dayCards.length > 0 ? (dayCorrect / dayCards.length) * 100 : 0;
      
      accuracyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        accuracy: dayAccuracy,
        cardsStudied: dayCards.length
      });
    }
    
    // Study time by day of week
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const studyTimeByDay = dayNames.map(day => ({
      day,
      minutes: 0
    }));
    
    studiedCards.forEach(card => {
      if (card.lastStudied) {
        const dayOfWeek = new Date(card.lastStudied).getDay();
        // Add 30 seconds (0.5 minutes) per card
        studyTimeByDay[dayOfWeek].minutes += 0.5;
      }
    });
    
    // Check if user has studied today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const studiedToday = studiedCards.some(card => {
      if (!card.lastStudied) return false;
      const studyDate = new Date(card.lastStudied);
      return studyDate >= today && studyDate < tomorrow;
    });
    
    // Calculate total correct vs incorrect
    const confidenceDistribution = [
      { name: 'Easy', value: studiedCards.filter(card => card.confidence === 3).length, color: '#10B981' },
      { name: 'Good', value: studiedCards.filter(card => card.confidence === 2).length, color: '#8B5CF6' },
      { name: 'Hard', value: studiedCards.filter(card => card.confidence === 1).length, color: '#F59E0B' },
      { name: 'Don\'t Know', value: studiedCards.filter(card => card.confidence === 0).length, color: '#EF4444' }
    ];
    
    // Calculate study streak (consecutive days with at least one study session)
    let streak = 0;
    if (studiedToday) {
      streak = 1;
      let checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - 1);
      
      while (true) {
        const nextDay = new Date(checkDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const studiedOnDay = studiedCards.some(card => {
          if (!card.lastStudied) return false;
          const studyDate = new Date(card.lastStudied);
          return studyDate >= checkDate && studyDate < nextDay;
        });
        
        if (studiedOnDay) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
    
    return {
      totalCards: decks.reduce((sum, deck) => sum + deck.cards.length, 0),
      studiedCards: studiedCards.length,
      recentDecks,
      averageAccuracy,
      totalStudyTimeMinutes,
      accuracyData,
      studyTimeByDay,
      studiedToday,
      confidenceDistribution,
      streak
    };
  }, [decks]);
  
  // Format date
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format relative time (e.g., "2 days ago")
  const formatRelativeTime = (date: Date | undefined) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(date);
  };
  
  // Format study time
  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
      return `${hours} hr`;
    }
    
    return `${hours} hr ${mins} min`;
  };
  
  // Toggle deck menu
  const toggleDeckMenu = (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deckMenuOpen === deckId) {
      setDeckMenuOpen(null);
    } else {
      setDeckMenuOpen(deckId);
    }
  };
  
  // Initiate deck deletion confirmation
  const confirmDeleteDeck = (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Uniform Deck Card component to ensure consistent appearance
  const DeckCard = ({ deck }: { deck: FlashcardDeck }) => {
    if (deleteConfirmation === deck.id) {
      return (
        <Card variant="modern" className="border-error-primary/40 bg-background-tertiary/80 h-full rounded-lg border border-white/20">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-error-primary/10 flex items-center justify-center mx-auto mb-4 border border-white/20">
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
      );
    }
    
    return (
      <div 
        className="h-full transition-all hover:shadow-md rounded-lg border border-white/20 hover:border-white/30 cursor-pointer overflow-hidden bg-background-secondary"
        onClick={() => navigate(`/decks/${deck.id}`)}
      >
        <div className="flex flex-col h-full">
          {/* Card Header */}
          <div className="p-4 border-b border-white/10 flex justify-between items-start">
            <h3 className="text-lg font-semibold truncate pr-2">{deck.name}</h3>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button 
                className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                onClick={(e) => toggleDeckMenu(deck.id, e)}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {deckMenuOpen === deck.id && (
                <div 
                  className="absolute right-0 top-10 z-10 bg-background-secondary border border-white/20 shadow-md rounded-lg overflow-hidden w-48"
                >
                  <div className="py-1">
                    <Link 
                      to={`/decks/${deck.id}`}
                      className="flex items-center px-4 py-2 text-sm hover:bg-white/5 w-full text-left"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Deck
                    </Link>
                    <button 
                      className="flex items-center px-4 py-2 text-sm hover:bg-white/5 w-full text-left text-error-primary"
                      onClick={(e) => confirmDeleteDeck(deck.id, e)}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete Deck
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Card Content */}
          <div className="p-4 flex-grow">
            <p className="text-gray-400 text-sm line-clamp-2 mb-4">
              {deck.description || 'No description'}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {deck.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/5 text-accent-secondary border border-white/20"
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
          </div>
          
          {/* Card Stats */}
          <div className="px-4 py-3 border-t border-white/10">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center text-sm text-gray-400">
                <Book className="w-4 h-4 mr-1" />
                {deck.cards.length} cards
              </div>
              
              <div className="flex items-center text-sm text-gray-400">
                {deck.lastStudied ? (
                  <>
                    <Clock className="w-4 h-4 mr-1" />
                    Last: {formatRelativeTime(deck.lastStudied)}
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-1" />
                    Created: {formatDate(deck.createdAt)}
                  </>
                )}
              </div>
            </div>
            
            {/* Card mastery indicator */}
            {deck.cards.length > 0 && (
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Card Mastery</span>
                  <span>{Math.round((deck.cards.filter(card => card.confidence >= 2).length / deck.cards.length) * 100)}%</span>
                </div>
                <ProgressBar
                  value={deck.cards.filter(card => card.confidence >= 2).length}
                  max={deck.cards.length}
                  size="sm"
                  variant="success"
                />
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-px mt-auto">
            <button
              className="bg-accent-primary hover:bg-accent-primary/90 text-white h-12 border-r border-white/10 text-sm font-medium transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/study/${deck.id}`);
              }}
            >
              Study Now
            </button>
            <button
              className="bg-accent-secondary hover:bg-accent-secondary/90 text-white h-12 text-sm font-medium transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/decks/${deck.id}`);
              }}
            >
              View Deck
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderOverviewTab = () => (
    <>
      {/* Study Statistics Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Study Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cards Studied */}
          <Card variant="modern">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Cards Studied</p>
                  <h3 className="text-2xl font-bold mt-1">{studyStats.studiedCards}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    of {studyStats.totalCards} total cards
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center border border-white/20">
                  <Book className="w-5 h-5 text-accent-primary" />
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar 
                  value={studyStats.studiedCards} 
                  max={studyStats.totalCards || 1} 
                  size="sm" 
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Total Study Time */}
          <Card variant="modern">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Study Time</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {formatStudyTime(studyStats.totalStudyTimeMinutes)}
                  </h3>
                  <p className="text-xs text-accent-secondary mt-1">
                    {studyStats.studiedToday ? '✓ Studied today' : 'No study session today'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-warning-primary/10 flex items-center justify-center border border-white/20">
                  <ClockIcon className="w-5 h-5 text-warning-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Average Accuracy */}
          <Card variant="modern">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Average Accuracy</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {Math.round(studyStats.averageAccuracy)}%
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Based on confidence ratings
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-success-primary/10 flex items-center justify-center border border-white/20">
                  <Award className="w-5 h-5 text-success-primary" />
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar 
                  value={Math.round(studyStats.averageAccuracy)} 
                  max={100} 
                  size="sm"
                  variant={studyStats.averageAccuracy >= 80 ? "success" : 
                          studyStats.averageAccuracy >= 60 ? "default" : "warning"}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Study Streak */}
          <Card variant="modern">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Study Streak</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {studyStats.streak} {studyStats.streak === 1 ? 'day' : 'days'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Consecutive days studied
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center border border-white/20">
                  <Activity className="w-5 h-5 text-accent-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Accuracy Chart */}
        <Card variant="modern" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Study Accuracy (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studyStats.accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#444' }}
                  formatter={(value: any) => [`${Math.round(value)}%`, 'Accuracy']}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Accuracy (%)"
                />
                <Line
                  type="monotone"
                  dataKey="cardsStudied"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Cards Studied"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Confidence Distribution */}
        <Card variant="modern">
          <CardHeader>
            <CardTitle>Confidence Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studyStats.confidenceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry) => entry.name}
                >
                  {studyStats.confidenceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#444' }}
                  formatter={(value: any) => [`${value} cards`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Study Time by Day */}
      <div className="mb-8">
        <Card variant="modern">
          <CardHeader>
            <CardTitle>Study Time by Day</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyStats.studyTimeByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#444' }}
                  formatter={(value: any) => [`${value} min`, 'Study Time']}
                />
                <Bar 
                  dataKey="minutes" 
                  fill="#8B5CF6" 
                  radius={[4, 4, 0, 0]} 
                  name="Study Time (min)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Recently Studied Decks */}
      {studyStats.recentDecks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Recently Studied Decks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {studyStats.recentDecks.map(deck => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        </div>
      )}
    </>
  );
  
  const renderDeckList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredDecks.map(deck => (
        <DeckCard key={deck.id} deck={deck} />
      ))}
    </div>
  );
  
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
            className="w-full sm:w-64 border border-white/20 rounded-lg"
          />
          
          <Button
            variant="primary"
            onClick={() => navigate('/create')}
            leftIcon={<Plus className="w-4 h-4" />}
            className="border border-white/10"
          >
            Create Deck
          </Button>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-white/20 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'overview' 
              ? 'text-accent-primary border-b-2 border-accent-primary' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'decks' 
              ? 'text-accent-primary border-b-2 border-accent-primary' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('decks')}
        >
          All Decks
        </button>
      </div>
      
      {activeTab === 'overview' ? (
        renderOverviewTab()
      ) : (
        filteredDecks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-background-tertiary border border-white/20 flex items-center justify-center mx-auto mb-4">
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
                className="border border-white/20"
              >
                Create Deck
              </Button>
            )}
          </div>
        ) : (
          renderDeckList()
        )
      )}
    </div>
  );
};