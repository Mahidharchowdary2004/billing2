import { useAppState } from '../state/store';
import { PaymentTerm } from '../types';
import { fmt, fmtDateTime, isToday } from '../utils';

const TERMS: PaymentTerm[] = ['Full Paid', 'Partial Advance', 'Credit (Khata)'];

export default function Dashboard() {
  const { sales, invoices, products, suppliers } = useAppState();

  const todaySales = sales.filter((s) => isToday(s.date));
  const todayInvoices = invoices.filter((i) => isToday(i.date));
  const posRevenue = todaySales.reduce((a, s) => a + s.total, 0);
  const b2bRevenue = todayInvoices.reduce((a, i) => a + i.total, 0);
  const lowStock = products.filter((p) => p.stock <= p.reorder);
  const creditB2B = invoices.filter((i) => i.term !== 'Full Paid').reduce((a, i) => a + i.total, 0);
  void suppliers;

  type Recent = { type: 'B2C' | 'B2B'; no: string; date: Date; amt: number; ref: string };
  const recent: Recent[] = [
    ...sales.map((s) => ({ type: 'B2C' as const, no: s.no, date: s.date, amt: s.total, ref: s.mode })),
    ...invoices.map((i) => ({ type: 'B2B' as const, no: i.no, date: i.date, amt: i.total, ref: i.party.name })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <>
      <div className="stat-row">
        <div className="card stat">
          <div className="label">B2C Retail Revenue (Today)</div>
          <div className="value">{fmt(posRevenue)}</div>
          <div className="delta">{todaySales.length} bills at counter</div>
        </div>
        <div className="card stat">
          <div className="label">B2B Wholesale Revenue (Today)</div>
          <div className="value">{fmt(b2bRevenue)}</div>
          <div className="delta">{todayInvoices.length} tax invoices raised</div>
        </div>
        <div className="card stat">
          <div className="label">Items Below Reorder Level</div>
          <div className="value">{lowStock.length}</div>
          <div className={`delta ${lowStock.length ? 'warn' : ''}`}>{lowStock.length ? 'Restock recommended' : 'Stock healthy'}</div>
        </div>
        <div className="card stat">
          <div className="label">Outstanding Credit (Khata)</div>
          <div className="value">{fmt(creditB2B)}</div>
          <div className="delta warn">Across {invoices.filter((i) => i.term !== 'Full Paid').length} B2B invoices</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <div className="panel">
          <div className="panel-head">
            <h2>Recent Activity — All Channels</h2>
            <span className="hint">Latest 8 transactions</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Channel</th>
                <th>Ref No.</th>
                <th>Party / Mode</th>
                <th>Date</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.length ? (
                recent.map((r) => (
                  <tr key={r.type + r.no}>
                    <td>
                      <span className={`badge ${r.type === 'B2B' ? 'muted' : 'ok'}`}>{r.type}</span>
                    </td>
                    <td className="mono">{r.no}</td>
                    <td>{r.ref}</td>
                    <td>{fmtDateTime(r.date)}</td>
                    <td className="num">{fmt(r.amt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty">
                    No transactions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <div className="panel-head">
            <h2>Reorder Alerts</h2>
            <span className="hint">Auto-flagged</span>
          </div>
          {lowStock.length ? (
            lowStock.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12.5px' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                    {p.sku} · reorder at {p.reorder}
                  </div>
                </div>
                <span className="badge bad">{p.stock} left</span>
              </div>
            ))
          ) : (
            <div className="empty">No items below safety stock</div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Payment Terms Mix — B2B</h2>
          <span className="hint">Across all wholesale invoices</span>
        </div>
        <div className="row3">
          {TERMS.map((term) => {
            const items = invoices.filter((i) => i.term === term);
            const total = items.reduce((a, i) => a + i.total, 0);
            return (
              <div className="card" style={{ padding: '14px 16px' }} key={term}>
                <div style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600 }}>{term}</div>
                <div className="mono" style={{ fontSize: '18px', fontWeight: 600, marginTop: 4 }}>
                  {fmt(total)}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', marginTop: 2 }}>
                  {items.length} invoice{items.length !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
