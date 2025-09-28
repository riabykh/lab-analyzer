import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import OneTimeAnalysis from '@/components/OneTimeAnalysis';

export const metadata: Metadata = {
  title: 'Lab Analysis | LabWise',
  description: 'Upload your lab results and get AI-powered insights and lifestyle recommendations.',
};

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  
  console.log('🔍 Analysis page params:', params);
  
  if (!params.session_id) {
    console.log('❌ No session_id provided, redirecting to checkout');
    redirect('/checkout');
  }

  return <OneTimeAnalysis sessionId={params.session_id} />;
}
