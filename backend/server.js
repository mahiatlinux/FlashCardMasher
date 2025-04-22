// server.js - Main entry point for the backend server
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const OpenAI = require('openai');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev'));

// Serve static files from the build directory (for React production build)
const buildDir = path.join(__dirname, 'build');
app.use(express.static(buildDir));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize OpenAI with the new SDK
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_API_BASE_URL || undefined,
});

// Helper function to extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Helper function to extract text from DOCX
async function extractTextFromDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

// Helper function to extract content from URL
async function extractTextFromURL(url) {
  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    return article ? article.textContent : '';
  } catch (error) {
    console.error('Error extracting text from URL:', error);
    throw new Error('Failed to extract text from URL');
  }
}

// Helper function to generate flashcards with OpenAI
async function generateFlashcardsWithAI(text, options) {
  try {
    const {
      cardCount = 10,
      difficulty = 'medium',
      termDefinition = true,
      questionAnswer = false
    } = options;
    
    // Create flashcard format instructions
    let formatInstructions = '';
    if (termDefinition && questionAnswer) {
      formatInstructions = 'Create a mix of term-definition pairs and question-answer format flashcards.';
    } else if (termDefinition) {
      formatInstructions = 'Create flashcards using term-definition pairs.';
    } else if (questionAnswer) {
      formatInstructions = 'Create flashcards using question-answer format.';
    } else {
      formatInstructions = 'Create flashcards using term-definition pairs.';
    }
    
    // Create difficulty instructions
    const difficultyInstructions = {
      easy: 'Focus on basic concepts and fundamental ideas. Use simple language.',
      medium: 'Include a mix of basic and intermediate concepts. Use clear language.',
      hard: 'Focus on advanced concepts and nuanced details. Use technical language when appropriate.',
      expert: 'Concentrate on complex concepts, edge cases, and deep insights. Use technical and precise language.'
    };
    
    // Create the prompt for the AI
    const prompt = `You are an expert flashcard creator who specializes in creating effective study materials.
    
    I want you to create ${cardCount} flashcards based on the following text.
    
    Difficulty level: ${difficulty}
    ${difficultyInstructions[difficulty]}
    
    Format: ${formatInstructions}
    
    Each flashcard should have:
    1. A front side with a term/question
    2. A back side with a definition/answer
    3. Tags that categorize the flashcard
    4. A difficulty rating ("easy", "medium", "hard", or "expert")
    
    Please format your response as a JSON array, with each flashcard as an object with the following structure:
    {
      "front": "Term or question",
      "back": "Definition or answer",
      "tags": ["tag1", "tag2"],
      "difficulty": "medium"
    }
    
    The text to create flashcards from is:
    
    ${text.slice(0, 15000)} ${text.length > 15000 ? '... (text truncated for processing)' : ''}
    
    Return ONLY the JSON array without any additional text or explanations.`;
    
    // Using the updated OpenAI v4 API
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-3.5-turbo-16k",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 4000
    });
    
    // Extract the JSON from the response (updated for v4 API)
    const content = response.choices[0].message.content.trim();
    
    // Parse the JSON response - handle potential formatting issues
    let flashcards;
    try {
      // Try to parse as is
      flashcards = JSON.parse(content);
    } catch (error) {
      // If direct parsing fails, try to extract JSON from the text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          flashcards = JSON.parse(jsonMatch[0]);
        } catch (innerError) {
          console.error('Error parsing extracted JSON:', innerError);
          throw new Error('Failed to parse AI response');
        }
      } else {
        console.error('Error parsing AI response:', error);
        throw new Error('Failed to parse AI response');
      }
    }
    
    // Validate the response format
    if (!Array.isArray(flashcards)) {
      throw new Error('Invalid response format from AI');
    }
    
    // Add unique IDs to each flashcard
    const flashcardsWithIds = flashcards.map(card => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...card
    }));
    
    return flashcardsWithIds;
  } catch (error) {
    console.error('Error generating flashcards with AI:', error);
    throw new Error('Failed to generate flashcards: ' + error.message);
  }
}

// API Routes

// Generate flashcards from text
app.post('/api/flashcards/generate-from-text', async (req, res) => {
  try {
    const { text, options } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Text content is required' });
    }
    
    if (!options) {
      return res.status(400).json({ error: 'Generation options are required' });
    }
    
    const flashcards = await generateFlashcardsWithAI(text, options);
    
    res.json({ flashcards });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate flashcards' });
  }
});

// Generate flashcards from file upload
app.post('/api/flashcards/generate-from-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }
    
    const { path: filePath, mimetype } = req.file;
    const options = JSON.parse(req.body.options);
    
    let text = '';
    
    // Extract text based on file type
    if (mimetype === 'application/pdf') {
      text = await extractTextFromPDF(filePath);
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await extractTextFromDOCX(filePath);
    } else if (mimetype === 'text/plain') {
      text = fs.readFileSync(filePath, 'utf8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }
    
    // Clean up file after processing
    fs.unlinkSync(filePath);
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'No text content could be extracted from the file' });
    }
    
    const flashcards = await generateFlashcardsWithAI(text, options);
    
    res.json({ flashcards });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate flashcards from file' });
  }
});

// Generate flashcards from URL
app.post('/api/flashcards/generate-from-url', async (req, res) => {
  try {
    const { url, options } = req.body;
    
    if (!url || url.trim() === '') {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    if (!options) {
      return res.status(400).json({ error: 'Generation options are required' });
    }
    
    const text = await extractTextFromURL(url);
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'No content could be extracted from the URL' });
    }
    
    const flashcards = await generateFlashcardsWithAI(text, options);
    
    res.json({ flashcards });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate flashcards from URL' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Catch-all route to serve the React app or 404 page
app.get('*', (req, res) => {
  const indexPath = path.join(buildDir, 'index.html');
  const notFoundPath = path.join(buildDir, '404.html');

  // First, check if the request is for an existing static asset
  const requestedPath = path.join(buildDir, req.path);
  
  // Check if the requested path is a file that exists
  fs.access(requestedPath, fs.constants.F_OK, (assetErr) => {
    if (!assetErr) {
      // If it's a valid file/asset, serve it directly
      return res.sendFile(requestedPath);
    }

    // If not a static asset, serve index.html for client-side routing
    fs.access(indexPath, fs.constants.F_OK, (indexErr) => {
      if (indexErr) {
        // No index.html found - try 404 page
        fs.access(notFoundPath, fs.constants.F_OK, (notFoundErr) => {
          if (!notFoundErr) {
            // 404.html exists
            return res.status(404).sendFile(notFoundPath);
          }
          
          // Fallback if no 404 page
          res.status(404).send('Page not found');
        });
        return;
      }

      // Serve index.html for client-side routing
      res.sendFile(indexPath);
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not set'}`);
});
