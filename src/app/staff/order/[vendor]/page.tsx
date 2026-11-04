import { notFound } from 'next/navigation';
import OrderApp from '../OrderApp';
import { VENDORS, vendorById } from '@/data/types';

export function generateStaticParams() {
  return VENDORS.filter(v => v.channel === 'A').map(v => ({ vendor: v.id }));
}

export default async function VendorOrderPage({ params }: { params: Promise<{ vendor: string }> }) {
  const { vendor } = await params;
  const cfg = vendorById(vendor);
  if (!cfg || cfg.channel !== 'A') notFound();
  return <OrderApp vendor={cfg} />;
}
