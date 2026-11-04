import WarehouseApp from '../warehouse/WarehouseApp';

// 提货 — store staff requisition from the warehouse.
export default function PickupPage() {
  return <WarehouseApp mode="pickup" />;
}
