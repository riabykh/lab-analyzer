import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentPatientSession } from '@/lib/b2b-auth';
import PatientDashboard from '@/components/PatientDashboard';

export const metadata: Metadata = {
  title: 'Dashboard | LabWise',
  description: 'View your lab results and health insights.',
};

export default async function DashboardPage() {
  const sessionResult = await getCurrentPatientSession();

  if (!sessionResult.success || !sessionResult.session || !sessionResult.patient || !sessionResult.clinic) {
    redirect('/login');
  }

  return (
    <PatientDashboard 
      session={sessionResult.session}
      patient={sessionResult.patient}
      clinic={sessionResult.clinic}
    />
  );
}
