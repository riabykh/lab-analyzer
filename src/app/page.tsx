import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'LabWise | AI-Powered Lab Analysis Platform',
  description: 'White-label AI-powered lab analysis platform for independent clinics.',
  keywords: 'lab analysis, health insights, AI, medical results, B2B, white-label',
};

export default function HomePage() {
  // Redirect to login for B2B model
  redirect('/login');
}