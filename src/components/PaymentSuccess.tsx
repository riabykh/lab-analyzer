'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface PaymentSuccessProps {
  sessionId?: string;
}

export default function PaymentSuccess({ sessionId }: PaymentSuccessProps) {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Poll for session creation (webhook processing)
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/check-payment-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.sessionCreated) {
            setStatus('success');
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              window.location.href = '/app';
            }, 3000);
            return;
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }

      // Continue polling if not successful
      if (countdown > 0) {
        setTimeout(checkSession, 1000);
      } else {
        setStatus('error');
      }
    };

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    // Start checking immediately
    checkSession();

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
              Welcome to LabWise Plus!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Your account has been upgraded successfully. Redirecting to your dashboard...
            </p>
            
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-800">
                🎉 You now have unlimited lab analysis access!
              </p>
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
