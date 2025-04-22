import { GenerationOptions, DifficultyLevel } from '../types';
import { useFlashcardStore } from '../store/useFlashcardStore';

// Simulated subjects and terms for mock generation
const mockSubjects = {
  'programming': [
    { term: 'React', definition: 'A JavaScript library for building user interfaces' },
    { term: 'TypeScript', definition: 'A strongly typed programming language that builds on JavaScript' },
    { term: 'Component', definition: 'A reusable piece of UI in modern frontend frameworks' },
    { term: 'State', definition: 'Data that changes over time in an application' },
    { term: 'Hook', definition: 'Functions that let you use React features in functional components' },
    { term: 'Promise', definition: 'An object representing the eventual completion of an asynchronous operation' },
    { term: 'API', definition: 'Application Programming Interface - a set of rules for building software' },
    { term: 'REST', definition: 'Representational State Transfer - an architectural style for APIs' },
    { term: 'GraphQL', definition: 'A query language for APIs and a runtime for executing those queries' },
    { term: 'Docker', definition: 'A platform for developing, shipping, and running applications in containers' }
  ],
  'science': [
    { term: 'Photosynthesis', definition: 'The process by which plants convert light energy into chemical energy' },
    { term: 'Mitochondria', definition: 'The powerhouse of the cell, responsible for producing energy' },
    { term: 'Gravity', definition: 'The force that attracts objects toward each other' },
    { term: 'DNA', definition: 'Deoxyribonucleic acid, the carrier of genetic information' },
    { term: 'Atom', definition: 'The basic unit of a chemical element' },
    { term: 'Periodic Table', definition: 'A tabular arrangement of chemical elements' },
    { term: 'Ecosystem', definition: 'A biological community of interacting organisms and their environment' },
    { term: 'Cell', definition: 'The smallest structural and functional unit of an organism' },
    { term: 'Evolution', definition: 'The process by which species change over time' },
    { term: 'Climate', definition: 'The weather conditions prevailing in an area over a long period' }
  ],
  'history': [
    { term: 'Renaissance', definition: 'A period of European cultural, artistic, and scientific revival' },
    { term: 'Industrial Revolution', definition: 'The transition to new manufacturing processes in the 18th-19th centuries' },
    { term: 'World War II', definition: 'A global war that lasted from 1939 to 1945' },
    { term: 'Cold War', definition: 'A period of geopolitical tension between the USA and USSR' },
    { term: 'French Revolution', definition: 'A period of radical social and political upheaval in France' },
    { term: 'Ancient Egypt', definition: 'An ancient civilization of Northeastern Africa' },
    { term: 'Byzantine Empire', definition: 'The eastern continuation of the Roman Empire' },
    { term: 'Enlightenment', definition: 'An intellectual movement emphasizing reason and individualism' },
    { term: 'Colonialism', definition: 'The policy of a country seeking to extend control over other territories' },
    { term: 'Magna Carta', definition: 'A charter of rights agreed to by King John of England in 1215' }
  ]
};

// Function to detect the subject from input content
const detectSubject = (content: string): string => {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('javascript') || contentLower.includes('react') || 
      contentLower.includes('programming') || contentLower.includes('code')) {
    return 'programming';
  } else if (contentLower.includes('science') || contentLower.includes('biology') || 
             contentLower.includes('physics') || contentLower.includes('chemistry')) {
    return 'science';
  } else if (contentLower.includes('history') || contentLower.includes('war') || 
             contentLower.includes('revolution') || contentLower.includes('empire')) {
    return 'history';
  }
  
  // Default to programming if no clear match
  return 'programming';
};

// Sleep function for simulating async operations
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock function to generate flashcards based on content and options
export const mockGenerateFlashcards = async (
  content: string,
  options: GenerationOptions,
  deckId: string,
  progressCallback: (progress: number, message: string) => void
): Promise<void> => {
  const { addCard } = useFlashcardStore.getState();
  
  // 1. Detect content type and subject
  progressCallback(10, 'Analyzing content...');
  await sleep(800);
  
  const subject = detectSubject(content);
  progressCallback(20, `Detected subject: ${subject}. Extracting key concepts...`);
  await sleep(1200);
  
  // 2. Get relevant mock data
  const mockTerms = mockSubjects[subject as keyof typeof mockSubjects] || mockSubjects.programming;
  
  // 3. Generate cards
  const cardCount = Math.min(options.cardCount, mockTerms.length);
  const selectedTerms = mockTerms.slice(0, cardCount);
  
  progressCallback(40, 'Generating flashcards...');
  
  for (let i = 0; i < selectedTerms.length; i++) {
    const { term, definition } = selectedTerms[i];
    
    // Create a card
    addCard(
      deckId,
      term,
      definition,
      [subject],
      options.difficulty
    );
    
    // Update progress
    const currentProgress = 40 + Math.floor((i + 1) / selectedTerms.length * 50);
    progressCallback(
      currentProgress,
      `Creating card ${i + 1} of ${selectedTerms.length}...`
    );
    
    // Small delay to simulate processing time
    await sleep(500);
  }
  
  progressCallback(95, 'Finalizing...');
  await sleep(700);
  
  progressCallback(100, 'Generation complete!');
};

// Function to generate a random question based on difficulty
export const generateMockQuestion = (difficulty: DifficultyLevel): { front: string; back: string } => {
  const subjects = Object.keys(mockSubjects);
  const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
  const terms = mockSubjects[randomSubject as keyof typeof mockSubjects];
  const randomTerm = terms[Math.floor(Math.random() * terms.length)];
  
  return {
    front: randomTerm.term,
    back: randomTerm.definition
  };
};