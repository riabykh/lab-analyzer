'use client';

import { useState, useEffect } from 'react';
import { X, FileText, Shield, AlertCircle } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ConsentModal({ isOpen, onAccept, onDecline }: ConsentModalProps) {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToMedical, setAgreedToMedical] = useState(false);

  const canProceed = hasReadTerms && hasReadPrivacy && agreedToTerms && agreedToPrivacy && agreedToMedical;

  const handleAccept = () => {
    if (canProceed) {
      // Store consent timestamp
      localStorage.setItem('labwise_consent', JSON.stringify({
        timestamp: new Date().toISOString(),
        version: '1.0',
        terms: true,
        privacy: true,
        medical: true
      }));
      onAccept();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Privacy & Terms Agreement
            </h2>
          </div>
          <button
            onClick={onDecline}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Medical Disclaimer - Most Important */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">
                  Important Medical Disclaimer
                </h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  LabWise provides <strong>educational information only</strong> and is not intended to replace 
                  professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare 
                  providers for medical decisions. Never disregard professional medical advice based on our analysis.
                </p>
              </div>
            </div>
          </div>

          {/* Terms and Privacy Links */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Terms and Conditions</h3>
                  <p className="text-sm text-gray-600">Service usage, limitations, and legal terms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/terms"
                  target="_blank"
                  onClick={() => setHasReadTerms(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  Read Terms
                </a>
                {hasReadTerms && (
                  <span className="text-green-600 text-sm">✓ Viewed</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Privacy Policy</h3>
                  <p className="text-sm text-gray-600">Data processing, storage, and your rights</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/privacy"
                  target="_blank"
                  onClick={() => setHasReadPrivacy(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  Read Policy
                </a>
                {hasReadPrivacy && (
                  <span className="text-green-600 text-sm">✓ Viewed</span>
                )}
              </div>
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-4 mb-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToMedical}
                onChange={(e) => setAgreedToMedical(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                required
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                <strong>I understand that LabWise provides educational information only</strong> and is not 
                medical advice. I will consult healthcare professionals for medical decisions.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={!hasReadTerms}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                required
              />
              <span className={`text-sm transition-colors ${!hasReadTerms ? 'text-gray-400' : 'text-gray-700 group-hover:text-gray-900'}`}>
                I have read and agree to the{' '}
                <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                  Terms and Conditions
                </a>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                disabled={!hasReadPrivacy}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                required
              />
              <span className={`text-sm transition-colors ${!hasReadPrivacy ? 'text-gray-400' : 'text-gray-700 group-hover:text-gray-900'}`}>
                I have read and agree to the{' '}
                <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          {/* Data Processing Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Data Processing Notice</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your lab results are processed in real-time and not permanently stored</li>
              <li>• Processing occurs in EU-compliant data centers</li>
              <li>• AI analysis is performed securely via OpenAI with data protection agreements</li>
              <li>• You can withdraw consent and delete your account at any time</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onDecline}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={!canProceed}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              canProceed
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
