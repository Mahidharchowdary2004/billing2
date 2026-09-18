import { useEffect, useRef, useState } from 'react';
import { useAppState } from '../../state/store';
import { useUi } from '../../state/ui';
import History from './History';
import NewInvoice from './NewInvoice';
import Parties from './Parties';
import InvoicePreview from './InvoicePreview';
import B2BReceiptPreview from './B2BReceiptPreview';

type Tab = 'new' | 'history' | 'parties';

export default function B2BView() {
  const { invoices, lastInvoiceId, settings } = useAppState();
  const { openModal } = useUi();
  const [tab, setTab] = useState<Tab>('new');

  const handled = useRef<number | null>(null);
  useEffect(() => {
    if (lastInvoiceId && handled.current !== lastInvoiceId) {
      handled.current = lastInvoiceId;
      const inv = invoices.find((i) => i.id === lastInvoiceId);
      if (inv) {
        if (settings.b2bPrintFormat === 'A4') {
          openModal(<InvoicePreview invoice={inv} />, { wide: true });
        } else {
          openModal(<B2BReceiptPreview invoice={inv} />);
        }
      }
    }
  }, [lastInvoiceId, invoices, openModal, settings.b2bPrintFormat]);

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
