import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Zap, FileText, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: <FileText className="w-10 h-10 text-accent-primary" />,
      title: 'Multi-Format Input',
      description: 'Upload PDFs, Word docs, or paste text directly',
    },
    {
      icon: <Brain className="w-10 h-10 text-accent-secondary" />,
      title: 'AI-Powered Generation',
      description: 'Smart extraction of key concepts and definitions',
    },
    {
      icon: <Zap className="w-10 h-10 text-teal-secondary" />,
      title: 'Interactive Study',
      description: 'Engaging flashcard interface with spaced repetition',
    },
    {
      icon: <Clock className="w-10 h-10 text-warning-secondary" />,
      title: 'Time-Saving',
      description: 'Create a full deck in minutes, not hours',
    },
  ];
  
  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      {/* Hero Section */}
      <header className="py-6 px-4 md:px-6 relative">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-accent-primary" />
            </div>
            <span className="text-xl font-bold">FlashCardMasher</span>
          </div>
          
          <div className="hidden md:flex space-x-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Dashboard</Button>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>Get Started</Button>
          </div>
        </nav>
      </header>
      
      <main className="flex-grow">
        {/* Hero content */}
        <section className="py-16 md:py-24 px-4 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-accent-primary/10 rounded-full filter blur-3xl"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 bg-teal-primary/10 rounded-full filter blur-3xl"></div>
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6 gradient-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Study Smarter<br/>Not Harder
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Transform your study materials into interactive flashcards in seconds.
                Powered by AI and created by Maheswar to help you learn faster and retain knowledge longer.
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Button 
                  variant="primary" 
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  onClick={() => navigate('/dashboard')}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                >
                  View Demo
                </Button>
              </motion.div>
            </div>
            
            {/* Mockup */}
            <motion.div
              className="relative max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <div className="bg-background-secondary rounded-2xl border border-gray-800 p-6 shadow-neomorphic">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Input panel */}
                  <div className="glass-effect rounded-xl p-4 border border-gray-700">
                    <h3 className="text-sm font-medium mb-2">Input Content</h3>
                    <div className="bg-background-tertiary rounded-lg p-3 text-xs text-gray-400 h-40 overflow-hidden">
                      <p>The human brain is composed of...</p>
                      <p className="mt-2">Neurons are specialized cells that...</p>
                      <p className="mt-2">The cerebral cortex consists of...</p>
                    </div>
                  </div>
                  
                  {/* Process animation */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-accent-primary/20 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-accent-primary animate-pulse" />
                    </div>
                    <div className="h-2 w-16 bg-accent-primary/20 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-accent-primary animate-shimmer" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', backgroundSize: '200% 100%' }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Processing...</p>
                  </div>
                  
                  {/* Flashcard */}
                  <div className="flip-container">
                    <div className="card-inner">
                      <div className="card-front rounded-xl bg-background-tertiary border border-gray-700 shadow-neomorphic-sm p-4 flex flex-col h-40">
                        <div className="text-xs text-gray-400 mb-2">Front</div>
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-center text-lg font-medium">What is the primary function of neurons?</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Features */}
        <section className="py-16 px-4 bg-background-secondary">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="neomorphic rounded-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>&copy; 2025 FlashCardMasher by Maheswar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};