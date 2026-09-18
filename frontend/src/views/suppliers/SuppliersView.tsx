import { useState } from 'react';
import SupplierLedger from './SupplierLedger';
import PurchaseOrders from './PurchaseOrders';

type Tab = 'ledger' | 'po';

export default function SuppliersView() {
  const [tab, setTab] = useState<Tab>('ledger');
  return (
    <>
      <div className="tabs">
        <button className={`tab ${tab === 'ledger' ? 'active' : ''}`} onClick={() => setTab('ledger')}>
          Supplier Ledger
        </button>
        <button className={`tab ${tab === 'po' ? 'active' : ''}`} onClick={() => setTab('po')}>
          Purchase Orders
        </button>
      </div>
      {tab === 'ledger' ? <SupplierLedger /> : <PurchaseOrders />}
    </>
  );
}
