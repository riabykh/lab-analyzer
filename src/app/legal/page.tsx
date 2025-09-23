import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white border border-gray-300 p-6">
          <h1 className="text-2xl font-normal text-gray-800 mb-6 border-b border-gray-200 pb-2">Legal Documents</h1>
          
          <div className="text-sm text-gray-700 leading-normal" style={{fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.3'}}>
            
            {/* Terms & Conditions */}
            <section className="mb-12">
              <h2 className="text-lg font-normal text-gray-800 mb-4 border-b border-gray-300 pb-1">Terms & Conditions</h2>
              
              <p className="mb-4"><strong>Effective date:</strong> 01 January 2025</p>
              <p className="mb-6"><strong>Last updated:</strong> 01 January 2025</p>

              <h3 className="font-medium mb-2">1) Who we are</h3>
              <p className="mb-4">
                These Terms & Conditions ("Terms") govern your access to and use of the website/app located at 
                <strong> app.labwise.rialys.eu</strong> and related services (the "Service") operated by 
                <strong> Mykyta Lysenko</strong>, a <strong>sole proprietorship registered in Slovakia</strong> with 
                its registered office at <strong>93040 Štvrtok na Ostrove, Štvrtok na Ostrove 654.</strong>
              </p>
              <p className="mb-4">
                <strong>Contact:</strong> mykyta.lysenko@rialys.eu<br/>
                <strong>EU Representative:</strong> Mykyta Lysenko/mykyta.lysenko@rialys.eu<br/>
                <strong>Data Protection Officer (if appointed):</strong> N/A
              </p>

              <h3 className="font-medium mb-2">2) What we do (and what we don't)</h3>
              <p className="mb-4">
                The Service provides <strong>educational explanations</strong> of laboratory test results and wellness information. 
                <strong> We do not provide medical diagnosis, treatment, or medical advice.</strong> The Service is not a 
                substitute for professional medical evaluation. In an emergency, call your local emergency number (EU: 112, US: 911).
              </p>

              <h3 className="font-medium mb-2">3) Eligibility</h3>
              <p className="mb-4">
                You must be <strong>at least 16 years old</strong> (or the minimum age of digital consent in your country, if higher) 
                to use the Service. By using the Service, you confirm you meet this requirement and have legal capacity to agree to these Terms.
              </p>

              <h3 className="font-medium mb-2">4) Local processing & your data</h3>
              <p className="mb-2">We designed the Service to <strong>avoid collecting or storing your personal data</strong> on our servers.</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li><strong>Local-only processing.</strong> Any lab values or health notes you input are processed locally in your browser. By default, they are not transmitted to us and not saved to our servers.</li>
                <li><strong>Local storage.</strong> If you choose to save settings or data on your device, such storage occurs in your browser and remains under your control.</li>
                <li><strong>No profiling.</strong> We do not build profiles, track health behavior, or sell personal data.</li>
                <li><strong>Minimal telemetry.</strong> We aim to run with no analytics. If we ever introduce operational logging, we will minimize data and document details in our Privacy Notice.</li>
              </ul>

              <h3 className="font-medium mb-2">5) Your responsibilities</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li><strong>Accuracy.</strong> You are responsible for the accuracy of any values you input.</li>
                <li><strong>Medical care.</strong> Always consult a licensed clinician before making health decisions.</li>
                <li><strong>Security of your device.</strong> Keep your device and browser secure; we cannot control or secure your personal device.</li>
              </ul>

              <h3 className="font-medium mb-2">6) Acceptable use</h3>
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>use the Service for unlawful, harmful, or fraudulent purposes;</li>
                <li>attempt to reverse engineer, bypass security, or disrupt the Service;</li>
                <li>upload or input content that is illegal, defamatory, or infringes rights;</li>
                <li>use automated scraping or bulk access outside documented export features.</li>
              </ul>

              <h3 className="font-medium mb-2">7) Liability & indemnity</h3>
              <p className="mb-4">
                To the fullest extent permitted by law: We are <strong>not liable</strong> for indirect, incidental, special, 
                or consequential damages, loss of profits, or loss/corruption of data arising from or related to your use of the Service. 
                You agree to <strong>indemnify and hold us harmless</strong> from claims arising out of your unlawful use of the Service 
                or violation of these Terms.
              </p>

              <h3 className="font-medium mb-2">8) Governing law & venue</h3>
              <p className="mb-4">
                These Terms are governed by the laws of <strong>Slovakia</strong>, excluding conflict of law rules. 
                Courts located in <strong>Bratislava, Slovakia</strong> will have exclusive jurisdiction, unless mandatory 
                consumer protection laws provide otherwise.
              </p>
            </section>

            {/* Privacy Policy */}
            <section className="mb-8">
              <h2 className="text-lg font-normal text-gray-800 mb-4 border-b border-gray-300 pb-1">Privacy Policy</h2>
              
              <p className="mb-4"><strong>Effective date:</strong> 01 January 2025</p>
              <p className="mb-6"><strong>Last updated:</strong> 01 January 2025</p>

              <h3 className="font-medium mb-2">1. Controller Information</h3>
              <p className="mb-4">
                This Privacy Policy applies to the processing of personal data by <strong>Mykyta Lysenko</strong>, 
                a sole proprietorship registered in Slovakia with its registered office at 
                <strong> 93040 Štvrtok na Ostrove, Štvrtok na Ostrove 654</strong>.
              </p>
              <p className="mb-4">
                <strong>Contact:</strong> mykyta.lysenko@rialys.eu<br/>
                <strong>EU Representative:</strong> Mykyta Lysenko / mykyta.lysenko@rialys.eu
              </p>

              <h3 className="font-medium mb-2">2. Data Collection and Processing</h3>
              <p className="mb-2">We designed LabWise to minimize data collection and processing. Our core principle is local-only processing.</p>
              
              <h4 className="font-medium mb-1">Local Processing</h4>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>All laboratory data analysis occurs locally in your browser</li>
                <li>Health data is not transmitted to our servers by default</li>
                <li>Results are processed using client-side artificial intelligence</li>
                <li>No personal health information is stored on our systems</li>
              </ul>

              <h4 className="font-medium mb-1">Minimal Server Data</h4>
              <p className="mb-2">We may process limited technical data for essential service operations:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>IP addresses in transient server logs (retained ≤ 30 days)</li>
                <li>Timestamp and user agent for security monitoring</li>
                <li>Error logs for service debugging (anonymized)</li>
              </ul>

              <h3 className="font-medium mb-2">3. Your Rights Under GDPR</h3>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Access your personal data</li>
                <li>Rectification of inaccurate data</li>
                <li>Erasure of your data</li>
                <li>Restriction of processing</li>
                <li>Data portability</li>
                <li>Object to processing</li>
              </ul>
              <p className="mb-4">
                To exercise these rights, contact: <strong>mykyta.lysenko@rialys.eu</strong>
              </p>

              <h3 className="font-medium mb-2">4. Security Measures</h3>
              <p className="mb-4">
                We implement appropriate technical and organizational measures including secure hosting infrastructure, 
                encrypted data transmission, regular security updates, and least-privilege access controls. 
                However, no system is completely secure. Keep your device and browser updated.
              </p>

              <h3 className="font-medium mb-2">5. Data Sharing</h3>
              <p className="mb-4">
                We do not sell, rent, or share personal data with third parties except as required by law, 
                with your explicit consent, or for essential service providers under strict data processing agreements.
              </p>
            </section>

            {/* Contact */}
            <section className="border-t border-gray-300 pt-4">
              <h3 className="font-medium mb-2">Contact Information</h3>
              <p className="mb-2">Questions about these Terms or Privacy Policy?</p>
              <p className="mb-1"><strong>Mykyta Lysenko</strong></p>
              <p className="mb-1">93040 Štvrtok na Ostrove, Štvrtok na Ostrove 654</p>
              <p className="mb-1">Slovakia</p>
              <p>Email: <strong>mykyta.lysenko@rialys.eu</strong></p>
            </section>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-300">
            <Link 
              href="/"
              className="text-gray-600 hover:text-gray-800 text-sm underline"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
