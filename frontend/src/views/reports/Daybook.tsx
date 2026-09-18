import { useAppState } from '../../state/store';
import { fmt, fmtDateTime, isToday } from '../../utils';

export default function Daybook() {
  const { sales, invoices } = useAppState();

  const todaySales = sales.filter((s) => isToday(s.date));
  const todayInvoices = invoices.filter((i) => isToday(i.date));

  const cash = todaySales.filter((s) => s.mode === 'Cash').reduce((a, s) => a + s.total, 0);
  const upi = todaySales.filter((s) => s.mode === 'UPI').reduce((a, s) => a + s.total, 0);
  const card = todaySales.filter((s) => s.mode === 'Card' || s.mode === 'Wallet').reduce((a, s) => a + s.total, 0);
  const b2bToday = todayInvoices.reduce((a, i) => a + i.total, 0);
  const gross = cash + upi + card + b2bToday;

  type Row = { type: 'B2B' | 'B2C'; no: string; date: Date; ref: string; total: number };
  const rows: Row[] = [
    ...todaySales.map((s) => ({ type: 'B2C' as const, no: s.no, date: s.date, ref: s.mode, total: s.total })),
    ...todayInvoices.map((i) => ({ type: 'B2B' as const, no: i.no, date: i.date, ref: i.party.name, total: i.total })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <div className="stat-row">
        <div className="card stat">
          <div className="label">Cash in Hand (Today)</div>
          <div className="value">{fmt(cash)}</div>
        </div>
        <div className="card stat">
          <div className="label">UPI Collection (Today)</div>
          <div className="value">{fmt(upi)}</div>
        </div>
        <div className="card stat">
          <div className="label">Card / Wallet (Today)</div>
          <div className="value">{fmt(card)}</div>
        </div>
        <div className="card stat">
          <div className="label">Gross Revenue (Today)</div>
          <div className="value">{fmt(gross)}</div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head">
          <h2>Today's Transaction Log</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Ref</th>
              <th>Time</th>
              <th>Mode / Party</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((r) => (
                <tr key={r.type + r.no}>
                  <td>
                    <span className={`badge ${r.type === 'B2B' ? 'muted' : 'ok'}`}>{r.type}</span>
                  </td>
                  <td className="mono">{r.no}</td>
                  <td>{fmtDateTime(r.date)}</td>
                  <td>{r.ref}</td>
                  <td className="num mono">{fmt(r.total)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="empty">
                  No transactions recorded today
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
