import { useAppState } from '../../state/store';
import { fmt } from '../../utils';

export default function SupplierLedger() {
  const { suppliers } = useAppState();
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Supplier Ledger</h2>
        <span className="hint">Billed vs paid, tracked for smooth vendor relations</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Supplier</th>
            <th>GSTIN</th>
            <th>Phone</th>
            <th className="num">Total Billed</th>
            <th className="num">Paid</th>
            <th className="num">Due</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => {
            const due = s.billed - s.paid;
            return (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td className="mono">{s.gstin}</td>
                <td className="mono">{s.phone}</td>
                <td className="num mono">{fmt(s.billed)}</td>
                <td className="num mono">{fmt(s.paid)}</td>
                <td className="num mono">{fmt(due)}</td>
                <td>
                  <span className={`badge ${due === 0 ? 'ok' : 'warn'}`}>{due === 0 ? 'Settled' : 'Due'}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
