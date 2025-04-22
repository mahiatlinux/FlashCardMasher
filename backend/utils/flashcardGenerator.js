// utils/flashcardGenerator.js
const OpenAI = require('openai');

// Initialize OpenAI with the new SDK
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_API_BASE_URL || undefined,
});

/**
 * Extract key concepts and topics from text
 * @param {string} text - The source text to analyze
 * @returns {Promise<string[]>} - Array of key concepts
 */
async function extractKeyTopics(text) {
  try {
    const prompt = `
    Extract the 5-10 most important concepts or topics from the following text.
    Return them as a JSON array of strings.
    
    Text:
    ${text.slice(0, 5000)}${text.length > 5000 ? '... (text truncated)' : ''}
    `;
    
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.3,
      max_tokens: 1000
    });
    
    const content = response.choices[0].message.content.trim();
    
    // Try to parse the JSON response
    try {
      // First, try direct parsing
      const topics = JSON.parse(content);
      return Array.isArray(topics) ? topics : [];
    } catch (error) {
      // If parsing fails, try to extract JSON array from the text
      const jsonMatch = content.match(/\[([\s\S]*)\]/);
      if (jsonMatch) {
        try {
          const topics = JSON.parse(`[${jsonMatch[1]}]`);
          return Array.isArray(topics) ? topics : [];
        } catch (innerError) {
          console.error('Error parsing extracted JSON:', innerError);
          return [];
        }
      }
      console.error('Failed to extract topics:', error);
      return [];
    }
  } catch (error) {
    console.error('Error extracting key topics:', error);
    return [];
  }
}

/**
 * Generate tags for flashcards based on the content
 * @param {string} front - The front content of the flashcard
 * @param {string} back - The back content of the flashcard
 * @returns {Promise<string[]>} - Array of tags
 */
async function generateTags(front, back) {
  try {
    const prompt = `
    Generate 1-3 relevant tags for a flashcard with the following content:
    
    Front: ${front}
    Back: ${back}
    
    Return the tags as a JSON array of strings.
    `;
    
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.3,
      max_tokens: 200
    });
    
    const content = response.choices[0].message.content.trim();
    
    // Try to parse the JSON response
    try {
      const tags = JSON.parse(content);
      return Array.isArray(tags) ? tags : [];
    } catch (error) {
      // If parsing fails, try to extract JSON array from the text
      const jsonMatch = content.match(/\[([\s\S]*)\]/);
      if (jsonMatch) {
        try {
          const tags = JSON.parse(`[${jsonMatch[1]}]`);
          return Array.isArray(tags) ? tags : [];
        } catch (innerError) {
          console.error('Error parsing extracted JSON:', innerError);
          return [];
        }
      }
      console.error('Failed to extract tags:', error);
      return [];
    }
  } catch (error) {
    console.error('Error generating tags:', error);
    return [];
  }
}

/**
 * Generate flashcards based on text content and options
 * @param {string} text - The source text
 * @param {Object} options - Generation options
 * @returns {Promise<Array>} - Array of flashcard objects
 */
async function generateFlashcards(text, options = {}) {
  // Implementation moved to server.js for now
  // This file can be expanded with more utility functions as needed
}

module.exports = {
  extractKeyTopics,
  generateTags,
  generateFlashcards
};