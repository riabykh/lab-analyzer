'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, FileIcon, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileAnalyzed: (analysis: any) => void;
  onError: (error: string) => void;
}

export default function FileUpload({ onFileAnalyzed, onError }: FileUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');

  const analyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    setProgress('Uploading file...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      setProgress('Extracting text...');
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      setProgress('Analyzing results...');
      const data = await response.json();

      if (data.success) {
        onFileAnalyzed(data.analysis);
        setProgress('Analysis complete!');
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      onError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setProgress(''), 3000);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      analyzeFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: isAnalyzing,
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-8 w-8" />;
    if (fileType === 'application/pdf') return <FileIcon className="h-8 w-8" />;
    return <FileText className="h-8 w-8" />;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isAnalyzing ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isAnalyzing ? (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-500" />
            <div>
              <p className="text-lg font-medium text-gray-900">Analyzing your lab results...</p>
              <p className="text-sm text-gray-600 mt-1">{progress}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your file here' : 'Upload lab results'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Drag & drop or click to select PDF, image, or text file
              </p>
            </div>
            
            <div className="flex justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <FileIcon className="h-4 w-4" />
                <span>PDF</span>
              </div>
              <div className="flex items-center space-x-1">
                <Image className="h-4 w-4" />
                <span>Image</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>Text</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {progress && !isAnalyzing && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{progress}</p>
        </div>
      )}
    </div>
  );
}


