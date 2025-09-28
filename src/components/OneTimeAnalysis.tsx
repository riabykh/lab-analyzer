'use client';

import { useState } from 'react';
import { Upload, FileText, Zap, CheckCircle, Download } from 'lucide-react';
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
    console.log('📊 Analysis completed:', results);
    
    if (analysisData) {
      setAnalysis(analysisData);
    } else {
      // Fallback structure if only results provided
      setAnalysis({
        results,
        critical_findings: [],
        summary: 'Analysis completed successfully.',
        recommendations: []
      });
    }
    
    setStep('results');
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
            ${analysis.results.map(result => `
              <div class="result ${result.status}">
                <h3>${result.test_name}</h3>
                <p><strong>Value:</strong> ${result.value} ${result.unit || ''}</p>
                ${result.reference_range ? `<p><strong>Reference Range:</strong> ${result.reference_range}</p>` : ''}
                <p><strong>Status:</strong> ${result.status.toUpperCase()}</p>
                <p><strong>Interpretation:</strong> ${result.interpretation}</p>
              </div>
            `).join('')}
          </div>
          
          ${analysis.critical_findings.length > 0 ? `
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
                ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Lab Analysis
              </h1>
              <p className="text-gray-600">
                AI-powered insights and lifestyle recommendations
              </p>
            </div>
            <button
              onClick={generatePDFReport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
          <p className="text-gray-700">{analysis?.summary}</p>
        </div>

        {/* Critical Findings */}
        {analysis?.critical_findings && analysis.critical_findings.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-900 mb-4">Critical Findings</h2>
            <ul className="space-y-2">
              {analysis.critical_findings.map((finding, index) => (
                <li key={index} className="text-red-800 flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  {finding}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lab Results */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Lab Results</h2>
          <div className="space-y-4">
            {analysis?.results.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{result.test_name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.status === 'normal' ? 'bg-green-100 text-green-800' :
                    result.status === 'high' ? 'bg-red-100 text-red-800' :
                    result.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {result.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-gray-500">Value:</span>
                    <span className="ml-2 font-medium">{result.value} {result.unit}</span>
                  </div>
                  {result.reference_range && (
                    <div>
                      <span className="text-sm text-gray-500">Reference Range:</span>
                      <span className="ml-2 font-medium">{result.reference_range}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 text-sm">{result.interpretation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lifestyle Recommendations */}
        <div className="bg-blue-50 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Lifestyle Recommendations</h2>
          <div className="space-y-3">
            {analysis?.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-blue-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
