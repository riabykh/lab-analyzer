'use client';

import { AlertTriangle, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Crown, Lock } from 'lucide-react';

interface LabResult {
  test_name: string;
  value: string;
  unit: string;
  reference_range?: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  interpretation: string;
}

interface Analysis {
  results: LabResult[];
  critical_findings: string[];
  summary: string;
  recommendations: string[];
}

interface ResultsDisplayProps {
  analysis?: Analysis;
  results?: any[];
  onNewAnalysis?: () => void;
  isPremium?: boolean;
  userTier?: string;
  showUpgradePrompt?: boolean;
}

export default function ResultsDisplay({ 
  analysis, 
  results, 
  onNewAnalysis = () => {}, 
  isPremium = false, 
  userTier = 'free',
  showUpgradePrompt = false 
}: ResultsDisplayProps) {
  const FREE_RESULTS_LIMIT = 3;
  const analysisResults = analysis?.results || results || [];
  const visibleResults = isPremium ? analysisResults : analysisResults.slice(0, FREE_RESULTS_LIMIT);
  const hiddenResultsCount = analysisResults.length - FREE_RESULTS_LIMIT;
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case 'low':
        return <TrendingDown className="h-5 w-5 text-blue-500" />;
      case 'normal':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      case 'normal':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-300 bg-white';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900">Lab Results Analysis</h2>
          {isPremium && (
            <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              <Crown className="h-3 w-3" />
              <span>Premium</span>
            </div>
          )}
        </div>
        <button
          onClick={onNewAnalysis}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Analyze New File
        </button>
      </div>

      {/* Critical Findings Alert */}
        {analysis?.critical_findings && analysis.critical_findings.length > 0 && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 shadow-md rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="h-6 w-6 text-red-700" />
            <h3 className="text-lg font-bold text-red-800">⚠️ Critical Findings</h3>
          </div>
          <ul className="list-disc pl-5 text-red-700 space-y-1">
            {analysis?.critical_findings?.map((finding, idx) => (
              <li key={idx}>{finding}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm font-medium text-red-800">
            Please consult a healthcare professional immediately regarding these results.
          </p>
        </div>
      )}

      {/* Summary */}
        {analysis?.summary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Summary</h3>
          <p className="text-blue-800">{analysis?.summary}</p>
        </div>
      )}

      {/* Lab Results Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Detailed Lab Results</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference Range
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interpretation
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleResults.map((result, idx) => (
                <tr key={idx} className={`border-l-4 ${getStatusColor(result.status)}`}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.status)}
                      <span className="text-sm font-medium capitalize">{result.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{result.test_name}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {result.value} {result.unit}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {result.reference_range || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-700">{result.interpretation}</div>
                  </td>
                </tr>
              ))}
              
              {/* Premium Upgrade Prompt for Free Users */}
              {!isPremium && hiddenResultsCount > 0 && (
                <tr className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-500">
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className="relative">
                      {/* Blurred Content Preview */}
                      <div className="absolute inset-0 bg-white bg-opacity-75 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <Lock className="h-8 w-8 mx-auto text-blue-600" />
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {hiddenResultsCount} more results available
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Unlock detailed analysis, trends, and personalized recommendations
                            </p>
                          </div>
                          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
                            <div className="flex items-center space-x-2">
                              <Crown className="h-4 w-4" />
                              <span>Upgrade to Premium</span>
                            </div>
                          </button>
                          <p className="text-xs text-gray-500">
                            Full health insights • Trend analysis • Doctor reports
                          </p>
                        </div>
                      </div>
                      
                      {/* Blurred Background Content */}
                      <div className="filter blur-sm opacity-50 space-y-2">
                        {analysis.results.slice(FREE_RESULTS_LIMIT).map((result, idx) => (
                          <div key={idx} className="py-4 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">{result.test_name}</span>
                              <span className="text-sm text-gray-500">{result.value} {result.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
        {analysis?.recommendations && analysis.recommendations.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-green-900">💡 Recommendations</h3>
            {!isPremium && (analysis?.recommendations?.length || 0) > 2 && (
              <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                <Lock className="h-3 w-3" />
                <span>{(analysis?.recommendations?.length || 0) - 2} more in Premium</span>
              </div>
            )}
          </div>
          <ul className="list-disc pl-5 text-green-800 space-y-2">
            {(isPremium ? analysis?.recommendations : analysis?.recommendations?.slice(0, 2) || []).map((recommendation, idx) => (
              <li key={idx}>{recommendation}</li>
            ))}
          </ul>
          {!isPremium && (analysis?.recommendations?.length || 0) > 2 && (
            <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
              <p className="text-sm text-green-700 mb-2">
                Get {(analysis?.recommendations?.length || 0) - 2} more personalized recommendations with Premium
              </p>
              <button className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors">
                Upgrade Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Medical Disclaimer</p>
            <p className="mt-1">
              This analysis is for educational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider regarding your health concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


