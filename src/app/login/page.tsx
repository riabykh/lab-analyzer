import { Metadata } from 'next';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Patient Login | LabWise',
  description: 'Access your lab results and health insights.',
};

export default function LoginPage() {
  return <LoginForm />;
}
