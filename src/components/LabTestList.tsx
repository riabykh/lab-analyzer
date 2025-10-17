'use client';

import { FileText, Calendar, Eye, Upload } from 'lucide-react';
import { LabTest } from '@/lib/lab-history';

interface LabTestListProps {
  tests: LabTest[];
  onSelectTest: (testId: string) => void;
}

export default function LabTestList({ tests, onSelectTest }: LabTestListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lab Tests</h1>
          <p className="text-gray-600 mt-1">
            View and analyze your laboratory test results
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Upload className="h-4 w-4" />
          Upload New Test
        </button>
      </div>

      {tests.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Tests ({tests.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {tests.map((test) => (
              <div
                key={test.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onSelectTest(test.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {test.testName}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(test.testDate).toLocaleDateString()}
                        </div>
                        <div>
                          File: {test.fileName}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      test.status === 'analyzed' ? 'bg-green-100 text-green-800' :
                      test.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {test.status === 'analyzed' ? 'Analyzed' :
                       test.status === 'pending' ? 'Processing' : 'Error'}
                    </span>
                    
                    <button className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </div>
                </div>
                
                {test.analysis && (
                  <div className="mt-4 pl-14">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {test.analysis.summary}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{test.analysis.results.length} results</span>
                      <span>{test.analysis.insights.length} insights</span>
                      <span>
                        Analyzed {new Date(test.analysis.analyzedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Lab Tests Yet</h3>
          <p className="text-gray-600 mb-6">
            Upload your first lab test to get started with AI-powered health insights.
          </p>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto">
            <Upload className="h-5 w-5" />
            Upload Lab Test
          </button>
        </div>
      )}
    </div>
  );
}
