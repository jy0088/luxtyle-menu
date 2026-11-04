import { redirect } from 'next/navigation';

// Legacy entry (installed home-screen icons point here) → default vendor.
export default function OrderIndex() {
  redirect('/staff/order/sj');
}
