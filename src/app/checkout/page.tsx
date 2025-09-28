import { Metadata } from 'next';
import StripeCheckout from '@/components/StripeCheckout';

export const metadata: Metadata = {
  title: 'Checkout | LabWise',
  description: 'Upgrade to LabWise Plus for unlimited lab analysis and advanced insights.',
};

export default function CheckoutPage() {
  return <StripeCheckout plan="plus" />;
}
