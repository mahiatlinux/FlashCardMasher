import { saveAs } from 'file-saver';
import { FlashcardDeck } from '../types';

export const exportDeck = (deck: FlashcardDeck, format: 'json' | 'csv' | 'anki' | 'quizlet'): void => {
  switch (format) {
    case 'json':
      const jsonContent = JSON.stringify(deck, null, 2);
      const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
      saveAs(jsonBlob, `${deck.name}.json`);
      break;

    case 'csv':
      const csvContent = [
        ['Front', 'Back', 'Tags', 'Difficulty', 'Created', 'Last Studied'].join(','),
        ...deck.cards.map(card => [
          `"${card.front}"`,
          `"${card.back}"`,
          `"${card.tags.join(';')}"`,
          card.difficulty,
          card.createdAt.toISOString(),
          card.lastStudied?.toISOString() || ''
        ].join(','))
      ].join('\n');
      const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(csvBlob, `${deck.name}.csv`);
      break;

    case 'anki':
      const ankiContent = deck.cards.map(card => 
        `${card.front}\t${card.back}\t${card.tags.join(';')}`
      ).join('\n');
      const ankiBlob = new Blob([ankiContent], { type: 'text/plain' });
      saveAs(ankiBlob, `${deck.name}.txt`);
      break;

    case 'quizlet':
      const quizletContent = deck.cards.map(card => 
        `${card.front} --- ${card.back}`
      ).join('\n');
      const quizletBlob = new Blob([quizletContent], { type: 'text/plain' });
      saveAs(quizletBlob, `${deck.name}.txt`);
      break;
  }
};

export const importDeck = async (file: File): Promise<FlashcardDeck | null> => {
  try {
    const content = await file.text();
    
    if (file.name.endsWith('.json')) {
      return JSON.parse(content);
    }
    
    if (file.name.endsWith('.csv')) {
      const lines = content.split('\n').slice(1); // Skip header
      const cards = lines.map(line => {
        const [front, back, tags, difficulty, created, lastStudied] = line.split(',');
        return {
          id: crypto.randomUUID(),
          front: front.replace(/"/g, ''),
          back: back.replace(/"/g, ''),
          tags: tags.replace(/"/g, '').split(';'),
          difficulty: difficulty as any,
          createdAt: new Date(created),
          lastStudied: lastStudied ? new Date(lastStudied) : undefined,
          confidence: 0
        };
      });
      
      return {
        id: crypto.randomUUID(),
        name: file.name.replace('.csv', ''),
        description: `Imported from ${file.name}`,
        cards,
        createdAt: new Date(),
        tags: Array.from(new Set(cards.flatMap(card => card.tags)))
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error importing deck:', error);
    return null;
  }
};