import { Metadata } from 'next';
import PaddleCheckout from '@/components/PaddleCheckout';

export const metadata: Metadata = {
  title: 'Checkout | LabWise',
  description: 'Upgrade to LabWise Plus for unlimited lab analysis and advanced insights.',
};

export default function CheckoutPage() {
  return <PaddleCheckout plan="plus" />;
}
