import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Globe, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | LabWise',
  description: 'Privacy policy for LabWise lab results analysis service - GDPR, CCPA, and global compliance.',
};

export default function PrivacyPage() {
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
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
            </div>
          </div>
          <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="prose prose-gray max-w-none">
            
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Rialys ("we," "our," or "us") operates the LabWise service at labwise.rialys.eu. 
                This Privacy Policy explains how we collect, use, and protect your information when 
                you use our AI-powered lab results analysis service.
              </p>
            </section>

            {/* Data Controller */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Controller Information</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="text-gray-700 space-y-1">
                  <li><strong>Company:</strong> Rialys</li>
                  <li><strong>Address:</strong> [Your EU Address]</li>
                  <li><strong>Email:</strong> privacy@rialys.eu</li>
                  <li><strong>Data Protection Officer:</strong> [DPO Email]</li>
                </ul>
              </div>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">1. Account Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li>Email address (for service delivery)</li>
                <li>Payment information (processed by Paddle)</li>
                <li>Service usage timestamps</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">2. Lab Results Data</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <ul className="list-disc pl-6 text-green-800 space-y-1">
                  <li><strong>Processing Only:</strong> We process your uploaded lab results to provide analysis</li>
                  <li><strong>No Storage:</strong> Lab data is processed in real-time and immediately deleted</li>
                  <li><strong>Client-Side Processing:</strong> File parsing occurs in your browser when possible</li>
                </ul>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-3">3. Technical Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li>IP address (for security and rate limiting)</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Usage analytics (anonymized)</li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Primary Purposes</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Service Delivery</h4>
                  <p className="text-gray-700 text-sm">Analyze your lab results using AI</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Payment Processing</h4>
                  <p className="text-gray-700 text-sm">Process subscriptions via Paddle</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Security</h4>
                  <p className="text-gray-700 text-sm">Prevent fraud and unauthorized access</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Communication</h4>
                  <p className="text-gray-700 text-sm">Send service-related emails only</p>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-3">Legal Bases (GDPR)</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li><strong>Consent:</strong> For processing lab results data</li>
                <li><strong>Contract Performance:</strong> For service delivery</li>
                <li><strong>Legitimate Interest:</strong> For security and fraud prevention</li>
              </ul>
            </section>

            {/* Data Processing */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Processing and Storage</h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium text-green-900 mb-3">Lab Results Processing</h3>
                <div className="grid md:grid-cols-2 gap-4 text-green-800">
                  <div>
                    <h4 className="font-medium mb-1">Location</h4>
                    <p className="text-sm">EU data centers (Vercel EU regions)</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Duration</h4>
                    <p className="text-sm">Processed immediately, no persistent storage</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">AI Processing</h4>
                    <p className="text-sm">OpenAI API with data processing agreements</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Encryption</h4>
                    <p className="text-sm">All data encrypted in transit (TLS 1.3)</p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-3">Account Data Storage</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li><strong>Retention:</strong> Deleted within 30 days of account closure</li>
                <li><strong>Location:</strong> EU data centers only</li>
                <li><strong>Security:</strong> Industry-standard encryption and access controls</li>
              </ul>
            </section>

            {/* Third-Party Services */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
              
              <div className="grid md:grid-cols-1 gap-4 mb-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900">OpenAI (AI Processing)</h3>
                  </div>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li><strong>Purpose:</strong> Lab results analysis</li>
                    <li><strong>Data Shared:</strong> Extracted text from lab results only</li>
                    <li><strong>Retention:</strong> OpenAI deletes data within 30 days</li>
                    <li><strong>Location:</strong> Compliant with EU data protection requirements</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Lock className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-medium text-gray-900">Paddle (Payment Processing)</h3>
                  </div>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li><strong>Purpose:</strong> Subscription and payment management</li>
                    <li><strong>Data Shared:</strong> Email, payment information</li>
                    <li><strong>Compliance:</strong> PCI DSS compliant, GDPR compliant</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-medium text-gray-900">Vercel (Hosting)</h3>
                  </div>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li><strong>Purpose:</strong> Application hosting and delivery</li>
                    <li><strong>Data Processing:</strong> EU regions only</li>
                    <li><strong>Compliance:</strong> GDPR compliant infrastructure</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Under GDPR (EU Users)</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li><strong>Access:</strong> Request copies of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate data</li>
                  <li><strong>Erasure:</strong> Request deletion of your data</li>
                  <li><strong>Portability:</strong> Receive your data in a portable format</li>
                </ul>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li><strong>Restriction:</strong> Limit processing of your data</li>
                  <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
                </ul>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-3">Under CCPA (California Users)</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li><strong>Right to Know:</strong> What personal information we collect and how it's used</li>
                <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
                <li><strong>Right to Opt-Out:</strong> Opt-out of sale of personal information (we don't sell data)</li>
                <li><strong>Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Global Rights:</strong> We extend similar rights to users in Canada (PIPEDA), 
                  Brazil (LGPD), Australia, and other jurisdictions as applicable.
                </p>
              </div>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Security</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Technical Measures</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li><strong>Encryption:</strong> AES-256 encryption at rest, TLS 1.3 in transit</li>
                    <li><strong>Access Controls:</strong> Multi-factor authentication for all systems</li>
                    <li><strong>Network Security:</strong> Firewalls, intrusion detection, DDoS protection</li>
                    <li><strong>Regular Audits:</strong> Security assessments and penetration testing</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Organizational Measures</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li><strong>Staff Training:</strong> Regular privacy and security training</li>
                    <li><strong>Data Minimization:</strong> Collect only necessary data</li>
                    <li><strong>Purpose Limitation:</strong> Use data only for stated purposes</li>
                    <li><strong>Incident Response:</strong> 72-hour breach notification procedures</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900">Data Protection Inquiries</h3>
                  </div>
                  <p className="text-gray-700">Email: privacy@rialys.eu</p>
                  <p className="text-gray-700">Response Time: Within 72 hours</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-medium text-gray-900">Supervisory Authority (EU)</h3>
                  </div>
                  <p className="text-gray-700 text-sm">
                    If you're unsatisfied with our response, you may contact your local data protection authority.
                  </p>
                </div>
              </div>
            </section>

            {/* Compliance */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Compliance Certifications</h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 mb-3"><strong>This policy complies with:</strong></p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>EU General Data Protection Regulation (GDPR)</li>
                    <li>California Consumer Privacy Act (CCPA/CPRA)</li>
                    <li>Canada Personal Information Protection and Electronic Documents Act (PIPEDA)</li>
                    <li>Brazil Lei Geral de Proteção de Dados (LGPD)</li>
                  </ul>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Australia Privacy Act 1988</li>
                    <li>Singapore Personal Data Protection Act (PDPA)</li>
                    <li>Other applicable data protection laws</li>
                  </ul>
                </div>
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
