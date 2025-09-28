'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Shield, CheckCircle, Star } from 'lucide-react';

declare global {
  interface Window {
    Stripe: any;
  }
}

interface StripeCheckoutProps {
  plan: 'plus';
  onSuccess?: (data: any) => void;
  onClose?: () => void;
}

export default function StripeCheckout({ plan, onSuccess, onClose }: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripe, setStripe] = useState<any>(null);

  useEffect(() => {
    // Load Stripe.js
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    
    script.onload = () => {
      if (window.Stripe && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        const stripeInstance = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        setStripe(stripeInstance);
        setStripeLoaded(true);
        setIsLoading(false);
      }
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const openCheckout = async () => {
    if (!stripe || !stripeLoaded) return;

    try {
      // Create checkout session
      const response = await fetch('/api/auth/stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'plus',
          success_url: `${window.location.origin}/app?payment=success`,
          cancel_url: `${window.location.origin}/checkout?payment=cancelled`,
        }),
      });

      const session = await response.json();
      
      if (session.error) {
        console.error('Checkout session creation failed:', session.error);
        return;
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        console.error('Stripe redirect error:', error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading secure checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Upgrade to LabWise Plus
            </h1>
            <p className="text-gray-600">
              Unlock unlimited lab analysis and advanced insights
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Plan Details */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Star className="h-4 w-4" />
                  Most Popular
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">LabWise Plus</h2>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  $18.86
                  <span className="text-lg font-normal text-gray-600">/analysis</span>
                </div>
                <p className="text-gray-600">Full clarity and control</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited insights on every report</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Trends & historical comparisons</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">PDF export & shareable reports</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Priority support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Advanced AI explanations</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Personalized recommendations</span>
                </div>
              </div>

              <button
                onClick={openCheckout}
                disabled={!stripeLoaded}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard className="h-5 w-5" />
                {stripeLoaded ? 'Secure Checkout' : 'Loading...'}
              </button>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Secure Payment</h3>
                  <p className="text-sm text-green-800">
                    Your payment is processed securely by Stripe. We never store your payment information.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Why upgrade to Plus?
            </h3>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-blue-100 rounded-lg p-3 flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Comprehensive Analysis</h4>
                  <p className="text-gray-600">
                    Get detailed explanations for every lab marker, not just the first 3. 
                    Understand patterns and correlations across all your results.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-purple-100 rounded-lg p-3 flex-shrink-0">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-5L9 9H7v10z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Professional Reports</h4>
                  <p className="text-gray-600">
                    Generate PDF reports to share with your healthcare providers. 
                    Professional formatting with all insights included.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-green-100 rounded-lg p-3 flex-shrink-0">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Priority Support</h4>
                  <p className="text-gray-600">
                    Get faster response times and priority assistance when you need help 
                    understanding your results.
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-gray-50 rounded-lg p-6 mt-8">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-3">
                "LabWise Plus helped me understand my cholesterol results in detail. 
                The comprehensive analysis showed patterns I never noticed before."
              </p>
              <p className="text-sm text-gray-600">— Sarah M., Healthcare Professional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
