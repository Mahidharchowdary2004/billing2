import { useState } from 'react';
import { useAppState } from '../../state/store';
import History from './History';
import NewInvoice from './NewInvoice';
import Parties from './Parties';

type Tab = 'new' | 'history' | 'parties';

export default function B2BView() {
  const { invoices } = useAppState();
  const [tab, setTab] = useState<Tab>('new');

  return (
    <>
      <div className="tabs">
        <button className={`tab ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}>
          New Tax Invoice
        </button>
        <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          Invoice History ({invoices.length})
        </button>
        <button className={`tab ${tab === 'parties' ? 'active' : ''}`} onClick={() => setTab('parties')}>
          Buyer Directory
        </button>
      </div>
      {tab === 'new' && <NewInvoice onGenerated={() => setTab('history')} />}
      {tab === 'history' && <History />}
      {tab === 'parties' && <Parties />}
    </>
  );
}
