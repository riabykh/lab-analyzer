'use client';

import { useState } from 'react';

export default function SimpleUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('🟢 Starting simple upload...');
      
      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 Sending to /api/simple-analyze');
      
      const response = await fetch('/api/simple-analyze', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response status:', response.status);

      const data = await response.json();
      console.log('📊 Response data:', data);

      if (response.ok && data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('💥 Upload error:', err);
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Simple File Analyzer</h1>
      
      {/* File Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select a .txt file:
        </label>
        <input
          type="file"
          accept=".txt"
          onChange={handleFileChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* File Info */}
      {file && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p><strong>File:</strong> {file.name}</p>
          <p><strong>Size:</strong> {file.size} bytes</p>
          <p><strong>Type:</strong> {file.type}</p>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={`w-full py-3 px-4 rounded font-medium ${
          !file || loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? 'Analyzing...' : 'Analyze File'}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
          <p className="text-red-700"><strong>Error:</strong> {error}</p>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
          <h3 className="font-bold text-green-800 mb-2">Analysis Result:</h3>
          <pre className="text-sm bg-white p-2 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
