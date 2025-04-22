import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface FileUploadProps {
  onFileAccepted: (file: File) => void;
  acceptedFileTypes?: string;
  maxSize?: number;
  label?: string;
  description?: string;
  error?: string;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileAccepted,
  acceptedFileTypes = '.pdf,.docx,.txt',
  maxSize = 5 * 1024 * 1024, // 5MB
  label = 'Upload file',
  description = 'Drag and drop your file here or click to browse',
  error,
  isLoading = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      onFileAccepted(file);
    }
  }, [onFileAccepted]);
  
  const { 
    getRootProps, 
    getInputProps, 
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({ 
    onDrop,
    accept: acceptedFileTypes ? { '': acceptedFileTypes.split(',') } : undefined,
    maxSize,
    multiple: false
  });
  
  const removeFile = () => {
    setSelectedFile(null);
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      {!selectedFile ? (
        <div 
          {...getRootProps()} 
          className={cn(
            'border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-background-primary',
            isDragActive ? 'border-accent-primary bg-accent-primary/10' : 'border-gray-700 hover:border-accent-primary/50',
            isDragAccept ? 'border-success-primary bg-success-primary/10' : '',
            isDragReject ? 'border-error-primary bg-error-primary/10' : '',
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          )}
        >
          <input {...getInputProps()} disabled={isLoading} />
          
          <div className="flex flex-col items-center justify-center">
            <Upload className={cn(
              'w-12 h-12 mb-4',
              isDragActive ? 'text-accent-primary animate-bounce' : 'text-gray-400'
            )} />
            
            <p className="text-lg font-medium mb-1">
              {isDragActive ? 'Drop file here' : description}
            </p>
            
            <p className="text-sm text-gray-400 mb-4">
              Supported formats: {acceptedFileTypes.replace(/\./g, '').split(',').join(', ')}
            </p>
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              Browse files
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-background-tertiary rounded-xl p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="bg-accent-primary/20 rounded-lg p-2 mr-3">
              <File className="w-6 h-6 text-accent-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-400">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={removeFile}
              disabled={isLoading}
              className="ml-2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 flex items-center text-error-secondary">
          <AlertCircle className="w-4 h-4 mr-1" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};