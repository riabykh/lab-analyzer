'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function DebugPage() {
  const [results, setResults] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnostics: any = {};

    // Test 1: Check current URL
    diagnostics.currentUrl = window.location.href;
    diagnostics.domain = window.location.hostname;

    // Test 2: Check cookies
    diagnostics.allCookies = document.cookie;
    diagnostics.sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('labwise_session='));

    // Test 3: Test free session creation
    try {
      const response = await fetch('/api/auth/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'debug@test.user' })
      });
      
      diagnostics.freeSessionStatus = response.status;
      diagnostics.freeSessionResponse = await response.json();
      diagnostics.freeSessionHeaders = Object.fromEntries(response.headers.entries());
    } catch (error) {
      diagnostics.freeSessionError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test 4: Check if we can access analyze endpoint
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('labwise_session='))
        ?.split('=')[1];

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const testResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: new FormData() // Empty form data
      });

      diagnostics.analyzeStatus = testResponse.status;
      diagnostics.analyzeResponse = await testResponse.json();
    } catch (error) {
      diagnostics.analyzeError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test 5: Check environment
    diagnostics.userAgent = navigator.userAgent;
    diagnostics.timestamp = new Date().toISOString();

    setResults(diagnostics);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const createFreeSession = async () => {
    try {
      const response = await fetch('/api/auth/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'manual@test.user' })
      });
      
      if (response.ok) {
        alert('✅ Free session created! Check updated diagnostics.');
        runDiagnostics();
      } else {
        const error = await response.json();
        alert(`❌ Failed: ${error.error}`);
      }
    } catch (error) {
      alert(`❌ Network error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">🔍 LabWise Diagnostics</h1>
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Manual Test Button */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Manual Test</h2>
              <button
                onClick={createFreeSession}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                🆓 Create Free Session
              </button>
            </div>

            {/* Diagnostics Results */}
            {Object.keys(results).length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Diagnostic Results</h2>
                
                {/* Current Environment */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">🌐 Environment</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>URL:</strong> {results.currentUrl}</div>
                    <div><strong>Domain:</strong> {results.domain}</div>
                    <div><strong>Timestamp:</strong> {results.timestamp}</div>
                  </div>
                </div>

                {/* Cookie Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">🍪 Cookies</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>Session Cookie:</strong> 
                      {results.sessionCookie ? (
                        <span className="text-green-600 ml-2">✅ Present</span>
                      ) : (
                        <span className="text-red-600 ml-2">❌ Missing</span>
                      )}
                    </div>
                    <div><strong>All Cookies:</strong> {results.allCookies || 'None'}</div>
                  </div>
                </div>

                {/* Free Session Test */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">🆓 Free Session API</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>Status:</strong> 
                      {results.freeSessionStatus === 200 ? (
                        <span className="text-green-600 ml-2">✅ {results.freeSessionStatus}</span>
                      ) : (
                        <span className="text-red-600 ml-2">❌ {results.freeSessionStatus}</span>
                      )}
                    </div>
                    <div><strong>Response:</strong> 
                      <pre className="bg-white p-2 rounded border mt-1 overflow-auto">
                        {JSON.stringify(results.freeSessionResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Analyze Endpoint Test */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">🔬 Analyze API</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>Status:</strong> 
                      {results.analyzeStatus === 400 ? (
                        <span className="text-yellow-600 ml-2">⚠️ {results.analyzeStatus} (Expected - no file)</span>
                      ) : results.analyzeStatus === 401 ? (
                        <span className="text-red-600 ml-2">❌ {results.analyzeStatus} (Auth required)</span>
                      ) : (
                        <span className="text-green-600 ml-2">✅ {results.analyzeStatus}</span>
                      )}
                    </div>
                    <div><strong>Response:</strong> 
                      <pre className="bg-white p-2 rounded border mt-1 overflow-auto">
                        {JSON.stringify(results.analyzeResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">📋 What to look for:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li><strong>Session Cookie:</strong> Should be "Present" after creating free session</li>
              <li><strong>Free Session API:</strong> Should return status 200</li>
              <li><strong>Analyze API:</strong> Should return 400 (no file) or 500 (no API key), NOT 401 (auth required)</li>
              <li><strong>If Analyze returns 401:</strong> Session cookie not working</li>
              <li><strong>If Analyze returns 500:</strong> Missing OPENAI_API_KEY environment variable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
