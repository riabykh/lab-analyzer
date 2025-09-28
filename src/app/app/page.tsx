import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import PaidUserDashboard from '@/components/PaidUserDashboard';
import PaymentSuccess from '@/components/PaymentSuccess';

export const metadata: Metadata = {
  title: 'LabWise Dashboard | Lab Analysis',
  description: 'Analyze your lab results with unlimited AI-powered insights.',
};

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; session_id?: string }>;
}) {
  const params = await searchParams;
  
  console.log('🔍 App page params:', params);
  
  // Handle payment success from Stripe
  if (params.payment === 'success') {
    console.log('✅ Payment success detected, showing PaymentSuccess component');
    return <PaymentSuccess sessionId={params.session_id} />;
  }

  const authResult = await getCurrentSession();
  
  if (!authResult.success || !authResult.session) {
    redirect('/checkout');
  }

  // Verify this is a paid user
  if (authResult.session.plan !== 'plus') {
    redirect('/checkout');
  }

  return <PaidUserDashboard session={authResult.session} />;
}
