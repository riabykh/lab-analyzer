'use client';

import { useState } from 'react';
import { Upload, FileText, Zap, CheckCircle, Download, AlertTriangle, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import FileUpload from './FileUpload';

interface OneTimeAnalysisProps {
  sessionId: string;
}

interface AnalysisResult {
  test_name: string;
  value: string;
  unit?: string;
  reference_range?: string;
  status: 'normal' | 'high' | 'low' | 'unknown';
  interpretation: string;
}

interface AnalysisResponse {
  results: AnalysisResult[];
  critical_findings: string[];
  summary: string;
  recommendations: string[];
}

export default function OneTimeAnalysis({ sessionId }: OneTimeAnalysisProps) {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileAnalyzed = (results: AnalysisResult[], analysisData?: any) => {
    console.log('📊 Analysis completed:', { results, analysisData });
    
    try {
      if (analysisData) {
        // Ensure all arrays are properly initialized
        const safeAnalysis = {
          results: Array.isArray(analysisData.results) ? analysisData.results : (Array.isArray(results) ? results : []),
          critical_findings: Array.isArray(analysisData.critical_findings) ? analysisData.critical_findings : [],
          summary: analysisData.summary || 'Analysis completed successfully.',
          recommendations: Array.isArray(analysisData.recommendations) ? analysisData.recommendations : []
        };
        console.log('📋 Setting safe analysis:', safeAnalysis);
        setAnalysis(safeAnalysis);
      } else {
        // Fallback structure if only results provided
        const fallbackAnalysis = {
          results: Array.isArray(results) ? results : [],
          critical_findings: [],
          summary: 'Analysis completed successfully.',
          recommendations: []
        };
        console.log('📋 Setting fallback analysis:', fallbackAnalysis);
        setAnalysis(fallbackAnalysis);
      }
      
      setStep('results');
    } catch (error) {
      console.error('❌ Error processing analysis results:', error);
      // Set a safe fallback
      setAnalysis({
        results: [],
        critical_findings: [],
        summary: 'Analysis completed, but there was an issue displaying the results.',
        recommendations: []
      });
      setStep('results');
    }
  };

  const generatePDFReport = () => {
    if (!analysis) return;

    // Simple PDF generation using browser print
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lab Analysis Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .result { margin-bottom: 15px; padding: 10px; border-left: 3px solid #3b82f6; }
            .critical { border-left-color: #ef4444; }
            .normal { border-left-color: #10b981; }
            .high { border-left-color: #f59e0b; }
            .low { border-left-color: #f59e0b; }
            .recommendations { background: #f3f4f6; padding: 15px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lab Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>File: ${fileName}</p>
          </div>
          
          <div class="section">
            <h2>Summary</h2>
            <p>${analysis.summary}</p>
          </div>
          
          <div class="section">
            <h2>Lab Results</h2>
            ${analysis.results && Array.isArray(analysis.results) ? analysis.results.map(result => `
              <div class="result ${result.status}">
                <h3>${result.test_name}</h3>
                <p><strong>Value:</strong> ${result.value} ${result.unit || ''}</p>
                ${result.reference_range ? `<p><strong>Reference Range:</strong> ${result.reference_range}</p>` : ''}
                <p><strong>Status:</strong> ${result.status.toUpperCase()}</p>
                <p><strong>Interpretation:</strong> ${result.interpretation}</p>
              </div>
            `).join('') : '<p>No lab results available.</p>'}
          </div>
          
          ${analysis.critical_findings && Array.isArray(analysis.critical_findings) && analysis.critical_findings.length > 0 ? `
            <div class="section">
              <h2>Critical Findings</h2>
              <ul>
                ${analysis.critical_findings.map(finding => `<li>${finding}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <div class="section">
            <h2>Lifestyle Recommendations</h2>
            <div class="recommendations">
              <ul>
                ${analysis.recommendations && Array.isArray(analysis.recommendations) ? analysis.recommendations.map(rec => `<li>${rec}</li>`).join('') : '<li>No recommendations available.</li>'}
              </ul>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Lab Analysis Ready
              </h1>
              <p className="text-gray-600">
                Your payment is confirmed. Upload your lab results to get instant AI-powered insights.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <CheckCircle className="h-4 w-4" />
                Payment Confirmed
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Your Lab Results</h2>
              <p className="text-gray-600">
                Upload your lab report and get comprehensive insights with lifestyle recommendations.
              </p>
            </div>

            <FileUpload
              onFileAnalyzed={handleFileAnalyzed}
              isProcessing={false}
              setIsProcessing={(processing) => setStep(processing ? 'analyzing' : 'upload')}
              onFileSelected={(file) => setFileName(file.name)}
            />

            <div className="mt-8 text-center text-sm text-gray-500">
              Session ID: {sessionId}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-center mb-6">
              <Zap className="h-16 w-16 text-blue-600 animate-pulse" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Analyzing Your Lab Results
            </h1>
            
            <p className="text-gray-600 mb-6">
              Our AI is processing your lab data and generating personalized insights...
            </p>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                This usually takes 30-60 seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Lab Analysis
              </h1>
              <p className="text-gray-700 text-lg">
                AI-powered insights and lifestyle recommendations
              </p>
            </div>
            <button
              onClick={generatePDFReport}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 focus:ring-4 focus:ring-blue-200 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              aria-label="Download your lab analysis report as PDF"
            >
              <Download className="h-5 w-5" aria-hidden="true" />
              Download Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="h-5 w-5 text-blue-700" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Analysis Summary</h2>
          </div>
          <p className="text-gray-800 leading-relaxed text-base">{analysis?.summary}</p>
        </div>

        {/* Critical Findings */}
        {analysis?.critical_findings && Array.isArray(analysis.critical_findings) && analysis.critical_findings.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-6" role="alert" aria-labelledby="critical-findings-title">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-800" />
              </div>
              <h2 id="critical-findings-title" className="text-xl font-semibold text-red-900">Critical Findings</h2>
            </div>
            <ul className="space-y-3" role="list">
              {analysis.critical_findings.map((finding, index) => (
                <li key={index} className="text-red-900 flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium leading-relaxed">{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lab Results */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 text-green-700" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Lab Results</h2>
          </div>
          <div className="space-y-4">
            {analysis?.results && Array.isArray(analysis.results) ? analysis.results.map((result, index) => {
              const getStatusConfig = (status: string) => {
                switch (status) {
                  case 'normal':
                    return {
                      icon: CheckCircle,
                      bgColor: 'bg-green-50',
                      borderColor: 'border-green-200',
                      iconColor: 'text-green-600',
                      textColor: 'text-green-800',
                      badgeColor: 'bg-green-100 text-green-800 border-green-300'
                    };
                  case 'high':
                    return {
                      icon: TrendingUp,
                      bgColor: 'bg-red-50',
                      borderColor: 'border-red-200',
                      iconColor: 'text-red-600',
                      textColor: 'text-red-800',
                      badgeColor: 'bg-red-100 text-red-800 border-red-300'
                    };
                  case 'low':
                    return {
                      icon: TrendingDown,
                      bgColor: 'bg-orange-50',
                      borderColor: 'border-orange-200',
                      iconColor: 'text-orange-600',
                      textColor: 'text-orange-800',
                      badgeColor: 'bg-orange-100 text-orange-800 border-orange-300'
                    };
                  default:
                    return {
                      icon: Minus,
                      bgColor: 'bg-gray-50',
                      borderColor: 'border-gray-200',
                      iconColor: 'text-gray-600',
                      textColor: 'text-gray-800',
                      badgeColor: 'bg-gray-100 text-gray-800 border-gray-300'
                    };
                }
              };
              
              const statusConfig = getStatusConfig(result.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={index} className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-lg p-4`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-5 w-5 ${statusConfig.iconColor}`} aria-hidden="true" />
                      <h3 className="font-semibold text-gray-900 text-lg">{result.test_name}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.badgeColor}`} 
                          role="status" 
                          aria-label={`Status: ${result.status}`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Value:</span>
                      <span className="ml-2 font-bold text-gray-900 text-lg">{result.value} {result.unit}</span>
                    </div>
                    {result.reference_range && (
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Reference Range:</span>
                        <span className="ml-2 font-medium text-gray-800">{result.reference_range}</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Interpretation:</h4>
                    <p className={`${statusConfig.textColor} leading-relaxed font-medium`}>{result.interpretation}</p>
                  </div>
                </div>
              );
              }) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="font-medium">No lab results found in the analysis.</p>
                  <p className="text-sm mt-1">Please ensure your file contains laboratory test results.</p>
                </div>
              )}
            </div>
          </div>

          {/* Lifestyle Recommendations */}
          <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-800" />
              </div>
              <h2 className="text-xl font-semibold text-blue-900">Lifestyle Recommendations</h2>
            </div>
            <div className="space-y-4">
              {analysis?.recommendations && Array.isArray(analysis.recommendations) ? analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                  <div className="p-1 bg-blue-100 rounded-full mt-1">
                    <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" aria-hidden="true" />
                  </div>
                  <p className="text-blue-900 font-medium leading-relaxed">{recommendation}</p>
                </div>
              )) : (
                <div className="text-center py-6 text-blue-700 bg-white rounded-lg border border-blue-200">
                  <CheckCircle className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                  <p className="font-medium">No specific recommendations available.</p>
                  <p className="text-sm mt-1">General health guidelines apply.</p>
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}
