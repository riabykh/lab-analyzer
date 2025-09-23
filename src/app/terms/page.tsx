import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms and Conditions | LabWise',
  description: 'Terms and conditions for using LabWise lab results analysis service.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to LabWise
            </Link>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Terms and Conditions</h1>
            </div>
          </div>
          <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="prose prose-gray max-w-none">
            
            {/* Agreement to Terms */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using LabWise ("Service"), operated by Rialys ("Company," "we," "us," or "our"), 
                you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of 
                these terms, you may not access the Service.
              </p>
            </section>

            {/* Service Description */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Description</h2>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">LabWise Platform</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                LabWise is an AI-powered educational tool that provides interpretations of laboratory test results. 
                The Service includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li>Lab results analysis using artificial intelligence</li>
                <li>Educational explanations of test markers</li>
                <li>PDF report generation</li>
                <li>Email delivery of reports</li>
              </ul>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium text-amber-900 mb-2">Educational Purpose Only</h3>
                <p className="text-amber-800">
                  <strong>IMPORTANT:</strong> LabWise provides educational information only and is not intended 
                  to replace professional medical advice, diagnosis, or treatment.
                </p>
              </div>
            </section>

            {/* Medical Disclaimers */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Disclaimers and Limitations</h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium text-red-900 mb-2">Not Medical Advice</h3>
                <ul className="list-disc pl-6 text-red-800 space-y-1">
                  <li><strong>Educational Only:</strong> All analysis is for educational purposes</li>
                  <li><strong>No Diagnosis:</strong> We do not diagnose medical conditions</li>
                  <li><strong>No Treatment:</strong> We do not recommend treatments</li>
                  <li><strong>Professional Consultation:</strong> Always consult qualified healthcare providers</li>
                  <li><strong>Emergency Situations:</strong> Seek immediate medical attention for emergencies</li>
                </ul>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-3">Accuracy Limitations</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li><strong>AI Technology:</strong> Results depend on AI interpretation accuracy</li>
                <li><strong>No Guarantee:</strong> We cannot guarantee completeness or accuracy</li>
                <li><strong>Reference Ranges:</strong> May vary between laboratories and populations</li>
                <li><strong>Context Dependent:</strong> Individual factors affect result interpretation</li>
              </ul>
            </section>

            {/* Acceptable Use */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceptable Use Policy</h2>
              
              <h3 className="text-lg font-medium text-green-900 mb-3">Permitted Uses</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li>Personal analysis of your own lab results</li>
                <li>Educational research and learning</li>
                <li>Sharing reports with healthcare providers</li>
                <li>Generating reports for family members (with consent)</li>
              </ul>

              <h3 className="text-lg font-medium text-red-900 mb-3">Prohibited Uses</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li><strong>Commercial Use:</strong> Reselling or redistributing our Service</li>
                <li><strong>Bulk Processing:</strong> Automated or high-volume processing</li>
                <li><strong>Fraudulent Activity:</strong> False information or payment fraud</li>
                <li><strong>System Interference:</strong> Attempting to disrupt or hack the Service</li>
                <li><strong>Third-Party Data:</strong> Processing others' data without consent</li>
                <li><strong>Reverse Engineering:</strong> Attempting to copy our algorithms</li>
              </ul>
            </section>

            {/* Payment Terms */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Terms and Billing</h2>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Subscription Plans</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li><strong>Free Tier:</strong> Limited analysis features</li>
                <li><strong>Paid Plans:</strong> Enhanced features and unlimited analysis</li>
                <li><strong>Pricing:</strong> As displayed on our website</li>
                <li><strong>Currency:</strong> Prices in EUR/USD as applicable</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Processing</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Payments are processed by Paddle, our trusted payment partner. We support credit cards, 
                PayPal, and bank transfers. Subscriptions automatically renew unless cancelled.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">Refunds and Cancellations</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li><strong>Cancellation:</strong> Cancel anytime from account settings</li>
                <li><strong>Refund Policy:</strong> Pro-rated refunds for unused subscription periods</li>
                <li><strong>Processing Time:</strong> Refunds processed within 5-10 business days</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Disclaimer of Warranties</h3>
                <p className="text-gray-700 text-sm">
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, 
                  INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
                  PURPOSE, AND NON-INFRINGEMENT.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Medical Liability Exclusion</h3>
                <p className="text-gray-700 text-sm">
                  WE SPECIFICALLY DISCLAIM ALL LIABILITY FOR MEDICAL DECISIONS, DIAGNOSES, TREATMENTS, 
                  OR HEALTH OUTCOMES RESULTING FROM USE OF OUR SERVICE.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">General Inquiries</h3>
                  <p className="text-gray-700">Email: support@rialys.eu</p>
                  <p className="text-gray-700">Website: https://labwise.rialys.eu</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Legal Notices</h3>
                  <p className="text-gray-700">Email: legal@rialys.eu</p>
                  <p className="text-gray-700">Address: [Legal Address]</p>
                </div>
              </div>
            </section>

            {/* Compliance */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Compliance Certifications</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>EU GDPR Compliant</li>
                  <li>US CCPA Compliant</li>
                  <li>Canada PIPEDA Compliant</li>
                  <li>Australia Privacy Act Compliant</li>
                </ul>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Brazil LGPD Compliant</li>
                  <li>Medical Device Regulations Acknowledged</li>
                  <li>Consumer Protection Laws Compliant</li>
                  <li>International Data Transfer Compliant</li>
                </ul>
              </div>
            </section>

          </div>
        </div>

        {/* Back to Top */}
        <div className="text-center mt-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to LabWise
          </Link>
        </div>
      </div>
    </div>
  );
}
