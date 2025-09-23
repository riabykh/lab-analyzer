'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Stethoscope, Zap, Crown, ArrowRight, CheckCircle, User } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  // Redirect to free flow for first-time users
  const handleFreeAccess = async () => {
    try {
      console.log('🆓 Creating free session...');
      
      // Create free session
      const response = await fetch('/api/auth/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'guest@free.user' })
      });
      
      console.log('📊 Free session response:', response.status);
      console.log('🍪 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Free session created:', data);
        console.log('🔄 Redirecting to /free...');
        router.push('/free');
      } else {
        const errorData = await response.json();
        console.error('❌ Free session failed:', errorData);
        alert('Failed to create free session. Please try again.');
      }
    } catch (error) {
      console.error('Free access error:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleUpgrade = () => {
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LabWise</h1>
                <p className="text-sm text-gray-600">AI-powered lab results analysis</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto py-16 px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Transform Your Lab Results into
            <span className="text-blue-600"> Clear Insights</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get instant, AI-powered analysis of your medical lab results. 
            Upload your reports and receive detailed explanations, interpretations, and actionable recommendations.
          </p>
        </div>

        {/* Pricing Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Try Free</h3>
              <p className="text-gray-600 mb-6">Get started with basic analysis</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">3 analyses per session</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Basic interpretations</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">PDF export</span>
                </div>
              </div>
              
              <button
                onClick={handleFreeAccess}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Start Free Analysis</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Premium Tier */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-xl p-8 relative text-white">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-yellow-500 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <p className="text-yellow-100 mb-6">Unlimited comprehensive analysis</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <span>Unlimited analyses</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <span>Detailed recommendations</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <span>Analysis history</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <span>Email reports</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <span>Priority support</span>
                </div>
              </div>
              
              <button
                onClick={handleUpgrade}
                className="w-full bg-white text-yellow-600 py-3 px-6 rounded-lg font-semibold hover:bg-yellow-50 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Upgrade to Premium</span>
                <Crown className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-600">Advanced ChatGPT-4 analysis with medical knowledge base for accurate interpretations.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy First</h3>
            <p className="text-gray-600">Zero data storage policy. Your medical information is processed and immediately discarded.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-gray-600">Get comprehensive analysis within seconds. Multiple file formats supported.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2025 LabWise. For educational purposes only.</p>
            <p className="mt-1">Not a substitute for professional medical advice. Always consult your healthcare provider.</p>
            <div className="mt-4 space-x-6">
              <a href="/legal" className="hover:text-blue-600 transition-colors">Terms & Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}