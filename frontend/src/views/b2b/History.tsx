import { useAppState } from '../../state/store';
import { useUi } from '../../state/ui';
import { fmt, fmtDate } from '../../utils';
import InvoicePreview from './InvoicePreview';

export default function History() {
  const { invoices } = useAppState();
  const { openModal } = useUi();

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>All Wholesale Invoices</h2>
        <span className="hint">{invoices.length} total</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Invoice No.</th>
            <th>Date</th>
            <th>Buyer</th>
            <th>GSTIN</th>
            <th>Terms</th>
            <th className="num">Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {invoices.length ? (
            invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="mono">{inv.no}</td>
                <td>{fmtDate(inv.date)}</td>
                <td>{inv.party.name}</td>
                <td className="mono" style={{ fontSize: 11 }}>
                  {inv.party.gstin}
                </td>
                <td>
                  <span className={`badge ${inv.term === 'Full Paid' ? 'ok' : inv.term === 'Credit (Khata)' ? 'bad' : 'warn'}`}>{inv.term}</span>
                </td>
                <td className="num mono">{fmt(inv.total)}</td>
                <td>
                  <button className="btn ghost sm" onClick={() => openModal(<InvoicePreview invoice={inv} />, { wide: true })}>
                    View / Print
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="empty">
                No invoices generated yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
