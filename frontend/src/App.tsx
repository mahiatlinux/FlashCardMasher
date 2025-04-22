import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { CreateFlashcards } from './pages/CreateFlashcards';
import { DeckDetails } from './pages/DeckDetails';
import { StudyMode } from './pages/StudyMode';
import { Settings } from './pages/Settings';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { useThemeStore } from './store/useThemeStore';

function App() {
  const { theme } = useThemeStore();
  
  // Apply theme when component mounts and when theme changes
  useEffect(() => {
    // Ensure theme is applied to document element
    document.documentElement.className = theme;
  }, [theme]);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateFlashcards />} />
          <Route path="/decks/:deckId" element={<DeckDetails />} />
          <Route path="/study" element={<StudyMode />} />
          <Route path="/study/:deckId" element={<StudyMode />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;