import { Metadata } from 'next';
import FreeUserFlow from '@/components/FreeUserFlow';

export const metadata: Metadata = {
  title: 'Free Lab Analysis | LabWise',
  description: 'Get 3 free lab result insights with LabWise AI analysis.',
};

export default function FreePage() {
  return <FreeUserFlow />;
}
