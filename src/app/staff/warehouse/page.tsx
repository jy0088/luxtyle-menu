import WarehouseApp from './WarehouseApp';

// 进货 — Jason: stock count + replenishment from vendors (红日 / JFC / LA pickup).
export default function WarehousePage() {
  return <WarehouseApp mode="inbound" />;
}
