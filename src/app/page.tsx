'use client';

import { useState } from 'react';
import { Stethoscope, AlertTriangle, Crown } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import ResultsDisplay from '@/components/ResultsDisplay';

export default function Home() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false); // Default to free tier

  const handleFileAnalyzed = (newAnalysis: any) => {
    setAnalysis(newAnalysis);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setAnalysis(null);
  };

  const handleNewAnalysis = () => {
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lab Results Analyzer</h1>
                <p className="text-sm text-gray-600">AI-powered medical lab analysis</p>
              </div>
            </div>
            
            {/* Premium Toggle (for demo purposes) */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsPremium(!isPremium)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isPremium
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Crown className="h-4 w-4" />
                <span>{isPremium ? 'Premium Active' : 'Try Premium'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4">
        {!analysis && !error && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Upload Your Lab Results for AI Analysis
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Get instant, comprehensive analysis of your medical lab results. 
                Upload PDF reports, images, or text files for detailed insights.
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600">Advanced ChatGPT analysis of your lab results with detailed interpretations.</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Private & Secure</h3>
                <p className="text-gray-600">Your data is processed securely and never stored on our servers.</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Multiple Formats</h3>
                <p className="text-gray-600">Support for PDF, images (PNG/JPG), and text files.</p>
              </div>
            </div>

            {/* File Upload */}
            <FileUpload onFileAnalyzed={handleFileAnalyzed} onError={handleError} />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">Analysis Error</h3>
              </div>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={handleNewAnalysis}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Results Display */}
        {analysis && (
          <ResultsDisplay 
            analysis={analysis} 
            onNewAnalysis={handleNewAnalysis} 
            isPremium={isPremium}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>© 2025 Lab Results Analyzer. For educational purposes only.</p>
            <p className="mt-1">Not a substitute for professional medical advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}