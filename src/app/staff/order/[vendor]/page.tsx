import { notFound } from 'next/navigation';
import OrderApp from '../OrderApp';
import { VENDORS, vendorById } from '@/data/vendors';

export function generateStaticParams() {
  return VENDORS.map(v => ({ vendor: v.id }));
}

export default async function VendorOrderPage({ params }: { params: Promise<{ vendor: string }> }) {
  const { vendor } = await params;
  const cfg = vendorById(vendor);
  if (!cfg) notFound();
  return <OrderApp vendor={cfg} />;
}
