import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Link as LinkIcon, AlignLeft, Brain, ArrowRight, X, Check, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { FileUpload } from '../components/ui/FileUpload';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useFlashcardStore } from '../store/useFlashcardStore';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { InputFormat, DifficultyLevel } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { checkApiHealth } from '../services/api';

export const CreateFlashcards: React.FC = () => {
  const navigate = useNavigate();
  const { createDeck } = useFlashcardStore();
  const { 
    inputText, 
    setInputText,
    inputFormat, 
    setInputFormat,
    addFileUpload,
    fileUploads,
    removeFileUpload,
    inputUrl,
    setInputUrl,
    generationOptions,
    setGenerationOptions,
    generateFlashcards,
    processingState,
    resetState
  } = useGeneratorStore();
  
  const [deckName, setDeckName] = useState('New Deck');
  const [deckDescription, setDeckDescription] = useState('');
  const [step, setStep] = useState<'input' | 'options' | 'processing'>('input');
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [createdDeckId, setCreatedDeckId] = useState<string | null>(null);
  
  // Check API connection on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const isHealthy = await checkApiHealth();
        setApiStatus(isHealthy ? 'connected' : 'error');
      } catch (error) {
        console.error('API health check error:', error);
        setApiStatus('error');
      }
    };
    
    checkApiConnection();
  }, []);
  
  const inputTypes: { id: InputFormat; label: string; icon: React.ReactNode; }[] = [
    { id: 'text', label: 'Text', icon: <AlignLeft className="w-5 h-5" /> },
    { id: 'pdf', label: 'PDF', icon: <FileText className="w-5 h-5" /> },
    { id: 'docx', label: 'DOCX', icon: <Upload className="w-5 h-5" /> },
    { id: 'url', label: 'URL', icon: <LinkIcon className="w-5 h-5" /> },
  ];
  
  const handleFileUpload = async (file: File) => {
    await addFileUpload(file);
  };
  
  const handleInputTypeChange = (type: InputFormat) => {
    setInputFormat(type);
  };
  
  const handleNextStep = () => {
    if (step === 'input') {
      setStep('options');
    } else if (step === 'options') {
      handleGenerateFlashcards();
    }
  };
  
  const handlePrevStep = () => {
    if (step === 'options') {
      setStep('input');
    } else if (step === 'processing') {
      resetState();
      setStep('options');
    }
  };
  
  const isNextDisabled = () => {
    if (apiStatus === 'error') {
      return true;
    }
    
    if (step === 'input') {
      if (inputFormat === 'text') {
        return !inputText.trim();
      } else if (inputFormat === 'pdf' || inputFormat === 'docx') {
        return fileUploads.length === 0;
      } else if (inputFormat === 'url') {
        return !inputUrl.trim();
      }
    }
    return false;
  };
  
  const handleGenerateFlashcards = async () => {
    setStep('processing');
    
    // Only create a new deck if we haven't created one already
    let deckId = createdDeckId;
    if (!deckId) {
      // Create new deck with initial tags array
      deckId = createDeck(deckName, deckDescription, []);
      setCreatedDeckId(deckId);
    }
    
    // Generate flashcards
    await generateFlashcards(deckId);
    
    // Navigate to deck page when successful
    if (processingState.status === 'success') {
      navigate(`/decks/${deckId}`);
    }
  };
  
  const renderApiStatus = () => {
    if (apiStatus === 'checking') {
      return (
        <div className="bg-warning-primary/10 border border-warning-primary rounded-lg p-3 mb-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-warning-primary mr-2"></div>
            <p className="text-sm text-warning-primary">Connecting to AI service...</p>
          </div>
        </div>
      );
    } else if (apiStatus === 'error') {
      return (
        <div className="bg-error-primary/10 border border-error-primary rounded-lg p-3 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-4 h-4 text-error-primary mr-2" />
            <p className="text-sm text-error-primary">
              Could not connect to AI service. Please check that the backend server is running.
            </p>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  const renderInputStep = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Create New Flashcards</h2>
        <p className="text-gray-400">Add your study content to generate flashcards</p>
      </div>
      
      {renderApiStatus()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card variant="default">
            <CardHeader>
              <CardTitle>Deck Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Deck Name"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="Enter a name for your deck"
                  fullWidth
                />
                
                <TextArea
                  label="Description"
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  placeholder="Enter a description for your deck"
                  fullWidth
                />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="default" className="mt-6">
            <CardHeader>
              <CardTitle>Input Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {inputTypes.map((type) => (
                  <button
                    key={type.id}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border ${
                      inputFormat === type.id
                        ? 'border-accent-primary bg-accent-primary/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => handleInputTypeChange(type.id)}
                  >
                    {type.icon}
                    <span className="mt-2 text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
              
              {inputFormat === 'text' && (
                <TextArea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your study material here..."
                  fullWidth
                />
              )}
              
              {(inputFormat === 'pdf' || inputFormat === 'docx') && (
                <FileUpload
                  onFileAccepted={handleFileUpload}
                  acceptedFileTypes={inputFormat === 'pdf' ? '.pdf' : '.docx'}
                  label={`Upload ${inputFormat.toUpperCase()} file`}
                />
              )}
              
              {inputFormat === 'url' && (
                <Input
                  label="Website URL"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://example.com/study-material"
                  fullWidth
                  leftIcon={<LinkIcon className="w-4 h-4" />}
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {fileUploads.length > 0 || inputText || inputUrl ? (
                <div>
                  {fileUploads.map((file) => (
                    <div key={file.id} className="mb-4 p-3 bg-background-tertiary rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 mr-2" />
                          <span>{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFileUpload(file.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {inputText && (
                    <div className="p-3 bg-background-tertiary rounded-lg">
                      <p className="text-sm text-gray-300 line-clamp-4">{inputText.substring(0, 200)}{inputText.length > 200 ? '...' : ''}</p>
                    </div>
                  )}
                  
                  {inputUrl && (
                    <div className="p-3 bg-background-tertiary rounded-lg">
                      <div className="flex items-center">
                        <LinkIcon className="w-5 h-5 mr-2 text-accent-primary" />
                        <span className="text-sm text-gray-300 truncate">{inputUrl}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400">No content added yet</p>
                  <p className="text-sm text-gray-500 mt-2">Add text or upload files to see a preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight className="w-5 h-5" />}
          onClick={handleNextStep}
          disabled={isNextDisabled()}
        >
          Continue
        </Button>
      </div>
    </div>
  );
  
  const renderOptionsStep = () => {
    const difficultyOptions: {value: DifficultyLevel, label: string}[] = [
      { value: 'easy', label: 'Easy' },
      { value: 'medium', label: 'Medium' },
      { value: 'hard', label: 'Hard' },
      { value: 'expert', label: 'Expert' }
    ];
    
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Customize Your Flashcards</h2>
          <p className="text-gray-400">Adjust generation settings to fit your study needs</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Card variant="default">
              <CardHeader>
                <CardTitle>Generation Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Number of Flashcards
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={generationOptions.cardCount}
                      onChange={(e) => setGenerationOptions({ cardCount: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-1">
                      <span>5</span>
                      <span>{generationOptions.cardCount}</span>
                      <span>50</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {difficultyOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                            generationOptions.difficulty === option.value
                              ? 'bg-accent-primary text-white'
                              : 'bg-background-tertiary text-gray-300 hover:bg-background-tertiary/80'
                          }`}
                          onClick={() => setGenerationOptions({ difficulty: option.value })}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Flashcard Format
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="term-definition"
                          checked={generationOptions.termDefinition}
                          onChange={(e) => setGenerationOptions({ termDefinition: e.target.checked })}
                          className="mr-2"
                        />
                        <label htmlFor="term-definition" className="text-sm text-gray-300">
                          Term-Definition Pairs
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="question-answer"
                          checked={generationOptions.questionAnswer}
                          onChange={(e) => setGenerationOptions({ questionAnswer: e.target.checked })}
                          className="mr-2"
                        />
                        <label htmlFor="question-answer" className="text-sm text-gray-300">
                          Question-Answer Format
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Sample Card Preview</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="flip-container w-full h-40 cursor-pointer">
                  <div className="card-inner">
                    <div className="card-front absolute w-full h-full rounded-xl bg-background-tertiary border border-gray-700 p-5 flex flex-col shadow-neomorphic-sm">
                      <div className="flex-1 flex items-center justify-center">
                        <h3 className="text-lg font-semibold text-center">What is the primary function of neurons?</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="neomorphic" className="mt-6">
              <CardHeader>
                <CardTitle>AI Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center mr-3">
                    <Brain className="w-5 h-5 text-accent-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Smart Extraction</p>
                    <p className="text-sm text-gray-400">Our AI engine will extract key concepts from your content</p>
                  </div>
                </div>
                
                <div className="bg-background-tertiary rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-2">Expected output:</p>
                  <ul className="text-sm space-y-1 text-gray-300">
                    <li>• {generationOptions.cardCount} flashcards</li>
                    <li>• {generationOptions.difficulty} difficulty</li>
                    <li>• {generationOptions.termDefinition && generationOptions.questionAnswer 
                        ? 'Mixed format (term-definition and question-answer)' 
                        : generationOptions.termDefinition 
                          ? 'Term-definition format' 
                          : 'Question-answer format'}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevStep}
          >
            Back
          </Button>
          
          <Button
            variant="primary"
            size="lg"
            rightIcon={<Brain className="w-5 h-5" />}
            onClick={handleNextStep}
          >
            Generate Flashcards
          </Button>
        </div>
      </div>
    );
  };
  
  const renderProcessingStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Generating Your Flashcards</h2>
        <p className="text-gray-400">Our AI is processing your content and creating flashcards</p>
      </div>
      
      <Card variant="neomorphic" className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center">
            {processingState.status === 'processing' && (
              <>
                <div className="w-20 h-20 rounded-full bg-accent-primary/20 flex items-center justify-center mb-6">
                  <Brain className="w-10 h-10 text-accent-primary animate-pulse" />
                </div>
                
                <h3 className="text-xl font-semibold mb-4">Processing Content</h3>
                <p className="text-gray-400 text-center mb-6">{processingState.message}</p>
                
                <div className="w-full mb-4">
                  <ProgressBar 
                    value={processingState.progress} 
                    animated 
                    size="lg" 
                  />
                </div>
                
                <p className="text-sm text-gray-500">This may take up to a minute for larger content</p>
              </>
            )}
            
            {processingState.status === 'success' && (
              <>
                <div className="w-20 h-20 rounded-full bg-success-primary/20 flex items-center justify-center mb-6">
                  <Check className="w-10 h-10 text-success-primary" />
                </div>
                
                <h3 className="text-xl font-semibold mb-4">Success!</h3>
                <p className="text-gray-400 text-center mb-6">{processingState.message}</p>
                
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    if (createdDeckId) {
                      navigate(`/decks/${createdDeckId}`);
                    } else {
                      navigate('/dashboard');
                    }
                  }}
                >
                  View Your Deck
                </Button>
              </>
            )}
            
            {processingState.status === 'error' && (
              <>
                <div className="w-20 h-20 rounded-full bg-error-primary/20 flex items-center justify-center mb-6">
                  <AlertTriangle className="w-10 h-10 text-error-primary" />
                </div>
                
                <h3 className="text-xl font-semibold mb-4">Error</h3>
                <p className="text-gray-400 text-center mb-6">{processingState.error}</p>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePrevStep}
                >
                  Try Again
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {processingState.status === 'processing' && (
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Processing Details</h3>
              <span className="text-sm text-gray-400">Step {Math.ceil(processingState.progress / 25)} of 4</span>
            </div>
            
            <div className="space-y-4">
              {['Analyzing content', 'Extracting key concepts', 'Generating flashcards', 'Finalizing'].map((step, index) => {
                const stepProgress = (index + 1) * 25;
                const isActive = processingState.progress >= index * 25 && processingState.progress < (index + 1) * 25;
                const isComplete = processingState.progress >= stepProgress;
                
                return (
                  <div key={index} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      isComplete 
                        ? 'bg-accent-primary' 
                        : isActive 
                          ? 'bg-accent-primary/50 animate-pulse' 
                          : 'bg-gray-700'
                    }`}>
                      {isComplete ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <span className="w-4 h-4" />
                      )}
                    </div>
                    <span className={isActive || isComplete ? 'text-white' : 'text-gray-500'}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      resetState();
      setCreatedDeckId(null);
    };
  }, [resetState]);
  
  return (
    <div className="py-4">
      {step === 'input' && renderInputStep()}
      {step === 'options' && renderOptionsStep()}
      {step === 'processing' && renderProcessingStep()}
    </div>
  );
};