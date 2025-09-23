'use client';

import { useState, useEffect } from 'react';
import { Mail, Upload, Gift, ArrowRight, Star, Lock } from 'lucide-react';
import FileUpload from './FileUpload';
import ResultsDisplay from './ResultsDisplay';
import ConsentModal from './ConsentModal';

interface AnalysisResult {
  marker: string;
  value: string;
  unit: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  explanation: string;
  referenceRange?: string;
}

export default function FreeUserFlow() {
  const [step, setStep] = useState<'welcome' | 'consent' | 'upload' | 'results'>('welcome');
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [usageCount, setUsageCount] = useState(0);
  const [showConsent, setShowConsent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if user already has a session
    const existingSession = localStorage.getItem('labwise_free_session');
    if (existingSession) {
      const session = JSON.parse(existingSession);
      setUsageCount(session.usageCount || 0);
      setEmail(session.email || '');
      if (session.usageCount >= 3) {
        setStep('results'); // Show upgrade prompt
      } else {
        setStep('upload');
      }
    }
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConsent(true);
  };

  const handleConsentAccept = async () => {
    setShowConsent(false);
    
    // Create free session
    try {
      const response = await fetch('/api/auth/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        // Store session locally for UI purposes
        localStorage.setItem('labwise_free_session', JSON.stringify({
          email,
          usageCount: 0,
          plan: 'free'
        }));
        setStep('upload');
      } else {
        console.error('Failed to create free session');
      }
    } catch (error) {
      console.error('Session creation error:', error);
    }
  };

  const handleFileAnalyzed = (analysisResults: AnalysisResult[]) => {
    const newUsageCount = usageCount + 1;
    setUsageCount(newUsageCount);
    setResults(analysisResults.slice(0, 3)); // Limit to 3 results for free
    setStep('results');

    // Update local session
    localStorage.setItem('labwise_free_session', JSON.stringify({
      email,
      usageCount: newUsageCount,
      plan: 'free'
    }));
  };

  const handleUpgrade = () => {
    window.location.href = '/checkout';
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Gift className="h-4 w-4" />
              Free Lab Analysis
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Get 3 Free Lab Insights
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Upload your lab results and get AI-powered explanations for the first 3 markers - completely free.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Upload</h3>
              <p className="text-gray-600">
                Drag & drop your PDF lab report or upload an image
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Get instant explanations powered by advanced AI
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Gift className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No Credit Card</h3>
              <p className="text-gray-600">
                Try LabWise risk-free with no payment required
              </p>
            </div>
          </div>

          {/* Email Form */}
          <div className="max-w-md mx-auto">
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address (optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Get your results emailed to you
                </p>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

          {/* Social Proof */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Trusted by 1200+ people</p>
            <div className="flex justify-center items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-gray-600">4.9/5 rating</span>
            </div>
          </div>
        </div>

        {/* Consent Modal */}
        <ConsentModal
          isOpen={showConsent}
          onAccept={handleConsentAccept}
          onDecline={() => setShowConsent(false)}
        />
      </div>
    );
  }

  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Free Lab Analysis</h1>
                <p className="text-gray-600">
                  Upload your lab results to get started
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Free analyses remaining</div>
                <div className="text-2xl font-bold text-blue-600">{3 - usageCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <FileUpload
            onFileAnalyzed={handleFileAnalyzed}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            maxInsights={3}
            userTier="free"
          />

          {/* Upgrade Prompt */}
          <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Want unlimited analysis?
                </h3>
                <p className="text-blue-100">
                  Upgrade to LabWise Plus for comprehensive insights on all your lab markers
                </p>
              </div>
              <button
                onClick={handleUpgrade}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                Upgrade Now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Free Analysis</h1>
                <p className="text-gray-600">
                  Here are insights for your first 3 lab markers
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Analyses used</div>
                <div className="text-2xl font-bold text-gray-900">{usageCount}/3</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <ResultsDisplay 
            results={results} 
            userTier="free"
            showUpgradePrompt={usageCount >= 3}
          />

          {/* Upgrade Section */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Lock className="h-4 w-4" />
                Limited Free Analysis
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                See All Your Lab Markers
              </h2>
              <p className="text-gray-600">
                Your report contains more markers. Upgrade to LabWise Plus to get 
                comprehensive analysis for all your lab results.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Free (Current)</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-600">First 3 lab markers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-600">Basic explanations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span className="text-gray-400">Limited to 3 analyses</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">LabWise Plus</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-600">All lab markers analyzed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-600">Comprehensive explanations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-600">PDF reports & sharing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-600">Unlimited analyses</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleUpgrade}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                Upgrade to Plus - $18.86
                <ArrowRight className="h-5 w-5" />
              </button>
              <p className="text-sm text-gray-500 mt-2">
                One-time payment per analysis
              </p>
            </div>
          </div>

          {/* Try Another Analysis */}
          {usageCount < 3 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setStep('upload')}
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Analyze Another File ({3 - usageCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
