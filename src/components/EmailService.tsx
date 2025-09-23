'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface EmailServiceProps {
  pdfBlob?: Blob;
  results: any[];
  userEmail: string;
  onEmailSent?: () => void;
}

export default function EmailService({ pdfBlob, results, userEmail, onEmailSent }: EmailServiceProps) {
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const sendEmailWithReport = async () => {
    if (!pdfBlob || !userEmail) return;

    setIsEmailSending(true);
    setEmailStatus('sending');

    try {
      // Convert blob to base64
      const base64PDF = await blobToBase64(pdfBlob);
      
      // Create summary
      const summary = createResultsSummary(results);

      const response = await fetch('/api/email/send-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          summary,
          pdfData: base64PDF,
          reportDate: new Date().toLocaleDateString(),
        }),
      });

      if (response.ok) {
        setEmailStatus('sent');
        onEmailSent?.();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      setEmailStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setIsEmailSending(false);
    }
  };

  const createResultsSummary = (results: any[]) => {
    const totalResults = results.length;
    const normalResults = results.filter(r => r.status === 'normal').length;
    const abnormalResults = totalResults - normalResults;
    const criticalResults = results.filter(r => r.status === 'critical').length;

    return {
      total: totalResults,
      normal: normalResults,
      abnormal: abnormalResults,
      critical: criticalResults,
      markers: results.slice(0, 5).map(r => ({ // First 5 for summary
        marker: r.marker,
        value: r.value,
        unit: r.unit,
        status: r.status
      }))
    };
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  if (emailStatus === 'sent') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-green-900">Report Sent Successfully</h3>
            <p className="text-sm text-green-800">
              Your lab analysis report has been sent to {userEmail}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (emailStatus === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Email Failed</h3>
            <p className="text-sm text-red-800 mb-2">{errorMessage}</p>
            <button
              onClick={() => setEmailStatus('idle')}
              className="text-sm text-red-700 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-blue-900 mb-2">Email Your Report</h3>
          <p className="text-sm text-blue-800 mb-3">
            Send a copy of your lab analysis report to {userEmail}
          </p>
          
          <button
            onClick={sendEmailWithReport}
            disabled={isEmailSending || !pdfBlob || !userEmail}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            {isEmailSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
