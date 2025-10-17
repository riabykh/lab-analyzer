'use client';

import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Minus,
  AlertTriangle,
  Info,
  Heart,
  Activity
} from 'lucide-react';
import { getLabTestById } from '@/lib/lab-history';

interface LabTestDetailProps {
  testId: string;
  onBack: () => void;
}

export default function LabTestDetail({ testId, onBack }: LabTestDetailProps) {
  const test = getLabTestById(testId);

  if (!test) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Test not found</p>
        <button 
          onClick={onBack}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Go back
        </button>
      </div>
    );
  }

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nutrition': return '🥗';
      case 'exercise': return '🏃‍♂️';
      case 'lifestyle': return '🌟';
      case 'monitoring': return '📊';
      default: return '💡';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{test.testName}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(test.testDate).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {test.fileName}
            </div>
          </div>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <Info className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-blue-900">Important Notice</h2>
        </div>
        <p className="text-blue-800">
          The insights and interpretations provided are for informational and educational purposes only. 
          They are not intended as medical advice, diagnosis, or treatment recommendations. 
          Always consult with your healthcare provider for medical decisions and treatment plans.
        </p>
      </div>

      {test.analysis ? (
        <>
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info className="h-5 w-5 text-blue-700" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Analysis Summary</h2>
            </div>
            <p className="text-gray-800 leading-relaxed">{test.analysis.summary}</p>
          </div>

          {/* Lab Results */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-5 w-5 text-green-700" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Lab Results</h2>
            </div>
            
            <div className="space-y-4">
              {test.analysis.results.map((result, index) => {
                const statusConfig = getStatusConfig(result.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div key={index} className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-lg p-4`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`h-5 w-5 ${statusConfig.iconColor}`} aria-hidden="true" />
                        <h3 className="font-semibold text-gray-900 text-lg">{result.testName}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.badgeColor}`} 
                            role="status" 
                            aria-label={`Status: ${result.status}`}>
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="text-sm font-semibold text-gray-800">Value:</span>
                        <span className="ml-2 font-bold text-gray-900 text-lg">{result.value} {result.unit}</span>
                      </div>
                      {result.referenceRange && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <span className="text-sm font-semibold text-gray-800">Reference Range:</span>
                          <span className="ml-2 font-semibold text-gray-900">{result.referenceRange}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Interpretation:</h4>
                      <p className={`${statusConfig.textColor} leading-relaxed font-medium`}>{result.interpretation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Health Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Heart className="h-5 w-5 text-purple-700" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Health Insights</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {test.analysis.insights.map((insight, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{getCategoryIcon(insight.category)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                      insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {insight.priority} priority
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{insight.title}</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{insight.description}</p>
                  
                  {insight.actionable && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-blue-600">
                      <CheckCircle className="h-3 w-3" />
                      Actionable recommendation
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Info */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>
                Analysis completed on {new Date(test.analysis.analyzedAt).toLocaleString()}
              </span>
              <span>
                Powered by {test.analysis.aiModel}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Analysis Pending</h3>
          <p className="text-gray-600">
            This test is still being processed. Check back later for your results and insights.
          </p>
        </div>
      )}
    </div>
  );
}
