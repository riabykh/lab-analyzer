'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface PaymentSuccessProps {
  sessionId?: string;
}

export default function PaymentSuccess({ sessionId }: PaymentSuccessProps) {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [countdown, setCountdown] = useState(10);
  
  console.log('🎉 PaymentSuccess component loaded with sessionId:', sessionId);

  useEffect(() => {
    // Activate premium account directly
    const activatePremium = async () => {
      try {
        console.log('🔄 Activating premium account for session:', sessionId);
        
        const response = await fetch('/api/auth/activate-premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Payment verified:', data);
          setStatus('success');
          // Redirect to one-time analysis page
          setTimeout(() => {
            window.location.href = `/analysis?session_id=${sessionId}`;
          }, 2000);
          return;
        } else {
          const errorData = await response.json();
          console.error('❌ Premium activation failed:', errorData);
        }
      } catch (error) {
        console.error('❌ Premium activation error:', error);
      }

      // Continue polling if not successful
      if (countdown > 0) {
        setTimeout(activatePremium, 2000); // Check every 2 seconds
      } else {
        setStatus('error');
      }
    };

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    // Start activation immediately
    activatePremium();

    return () => clearInterval(timer);
  }, [sessionId, countdown]);

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-center mb-6">
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            
            <p className="text-gray-600 mb-6">
              We're setting up your LabWise Plus account. This usually takes a few seconds.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Processing your subscription... ({countdown}s)
              </p>
            </div>
            
            <div className="text-xs text-gray-500">
              Session ID: {sessionId || 'Unknown'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Your payment is confirmed. Redirecting to your lab analysis page...
            </p>
            
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800 font-semibold mb-2">
                🎉 Ready for Analysis:
              </p>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Upload your lab results</li>
                <li>• Get AI-powered insights</li>
                <li>• Receive lifestyle recommendations</li>
                <li>• Download your analysis report</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <AlertCircle className="h-16 w-16 text-yellow-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Processing Taking Longer
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your payment was successful, but account setup is taking longer than expected.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/app'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Continue to Dashboard
            </button>
            
            <p className="text-xs text-gray-500">
              If you continue to have issues, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
