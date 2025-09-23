'use client';

import { useState } from 'react';
import { Crown, Upload, FileText, Download, Settings, LogOut } from 'lucide-react';
import FileUpload from './FileUpload';
import ResultsDisplay from './ResultsDisplay';
import { usePDFGenerator } from './PDFGenerator';
import type { UserSession } from '@/lib/auth';

interface AnalysisResult {
  marker: string;
  value: string;
  unit: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  explanation: string;
  referenceRange?: string;
  recommendation?: string;
}

interface PaidUserDashboardProps {
  session: UserSession;
}

export default function PaidUserDashboard({ session }: PaidUserDashboardProps) {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<Array<{
    id: string;
    date: string;
    fileName: string;
    resultCount: number;
  }>>([]);

  const { downloadPDF, previewPDF } = usePDFGenerator(results as any, {
    reportId: `LW-${Date.now()}`,
    testDate: new Date().toLocaleDateString(),
  });

  const handleFileAnalyzed = (analysisResults: AnalysisResult[]) => {
    setResults(analysisResults);
    
    // Add to history
    const newHistoryItem = {
      id: `analysis-${Date.now()}`,
      date: new Date().toISOString(),
      fileName: 'Lab Results', // In real app, get from file upload
      resultCount: analysisResults.length
    };
    
    setAnalysisHistory(prev => [newHistoryItem, ...prev]);
  };

  const handleLogout = () => {
    // Clear session cookie
    document.cookie = 'labwise_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = 'https://labwise.rialys.eu';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                <span className="text-lg font-semibold text-gray-900">LabWise Plus</span>
              </div>
              <div className="text-sm text-gray-600">
                Welcome back, {session.email}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Analyses this month</div>
                <div className="text-lg font-semibold text-gray-900">{session.usageCount}</div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Upload Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Analyze Lab Results
                </h2>
              </div>
              
              <FileUpload
                onFileAnalyzed={handleFileAnalyzed}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                userTier="plus"
              />
            </div>

            {/* Results Section */}
            {results.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Analysis Results
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={previewPDF}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Preview PDF
                    </button>
                    <button
                      onClick={downloadPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </button>
                  </div>
                </div>
                
                <ResultsDisplay 
                  results={results} 
                  userTier="plus"
                />
              </div>
            )}

            {/* Plus Features Showcase */}
            {results.length === 0 && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-start gap-4">
                  <Crown className="h-8 w-8 text-yellow-300 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-2xl font-bold mb-4">
                      LabWise Plus Features
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <span>Unlimited lab analyses</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <span>Comprehensive explanations for all markers</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <span>Professional PDF reports</span>
                        </li>
                      </ul>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <span>Advanced AI insights</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <span>Priority support</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <span>Trend analysis & comparisons</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Analysis History */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Analyses</h3>
              
              {analysisHistory.length > 0 ? (
                <div className="space-y-3">
                  {analysisHistory.slice(0, 5).map((item) => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-900 text-sm">
                        {item.fileName}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-blue-600">
                        {item.resultCount} markers analyzed
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">
                  No analyses yet. Upload your first lab report to get started!
                </p>
              )}
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Account</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">Plan</div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-900">LabWise Plus</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700">Email</div>
                  <div className="text-sm text-gray-900">{session.email}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700">Usage</div>
                  <div className="text-sm text-gray-900">
                    {session.usageCount} analyses this month
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-800 text-sm mb-4">
                As a Plus member, you get priority support for any questions about your lab results.
              </p>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Contact Support →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
