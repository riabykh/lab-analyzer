import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

export default async function TermsPage() {
  let content = '';
  
  try {
    const filePath = path.join(process.cwd(), 'TERMS_CONDITIONS.md');
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    content = 'Terms & Conditions content is not available.';
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white border border-gray-300 p-6">
          <h1 className="text-2xl font-normal text-gray-800 mb-4 border-b border-gray-200 pb-2">Terms & Conditions</h1>
          
          <div className="text-sm text-gray-700 leading-normal" style={{fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.3'}}>
            <ReactMarkdown>{content}</ReactMarkdown>
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