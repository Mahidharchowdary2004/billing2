import { useState } from 'react';
import Daybook from './Daybook';
import GSTR1 from './GSTR1';
import GSTR3B from './GSTR3B';
import Profitability from './Profitability';

type Tab = 'daybook' | 'gstr1' | 'gstr3b' | 'profit';

export default function ReportsView() {
  const [tab, setTab] = useState<Tab>('daybook');

  const TABS: { id: Tab; label: string }[] = [
    { id: 'daybook', label: 'Day-Book' },
    { id: 'gstr1', label: 'GSTR-1 Ready Export' },
    { id: 'gstr3b', label: 'GSTR-3B Summary' },
    { id: 'profit', label: 'Item Profitability' },
  ];

  return (
    <>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'daybook' && <Daybook />}
      {tab === 'gstr1' && <GSTR1 />}
      {tab === 'gstr3b' && <GSTR3B />}
      {tab === 'profit' && <Profitability />}
    </>
  );
}
