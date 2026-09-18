import { ViewName } from '../types';
import { IconMenu } from './icons';

const TITLES: Record<ViewName, string> = {
  dashboard: 'Dashboard',
  inventory: 'Inventory Catalog',
  b2b: 'B2B Wholesale — GST Invoicing',
  pos: 'B2C Retail — Quick Checkout',
  suppliers: 'Suppliers & Procurement',
  reports: 'GST & Business Reports',
};

const SUBTITLES: Record<ViewName, string> = {
  dashboard: "Today's snapshot across both wholesale and retail channels",
  inventory: 'Single source of truth for stock, pricing tiers and tax tags',
  b2b: 'A4/A5 tax invoice, GSTIN capture, CGST/SGST/IGST split, e-way bill',
  pos: 'Barcode-driven checkout with thermal 2"/3" receipt output',
  suppliers: 'Purchase orders, landed cost and supplier ledgers',
  reports: 'GSTR-1, GSTR-3B, day-book and item profitability',
};

export default function Topbar({ view, onMenuClick }: { view: ViewName; onMenuClick: () => void }) {
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="menu-btn" onClick={onMenuClick}>
          <IconMenu />
        </button>
        <div>
          <h1>{TITLES[view]}</h1>
          <div className="meta">{SUBTITLES[view]}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }} className="no-print">
        <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>Counter: Main Store, Hyderabad</div>
      </div>
    </div>
  );
}
