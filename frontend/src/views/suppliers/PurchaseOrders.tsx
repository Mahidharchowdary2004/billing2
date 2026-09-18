import { IconPlus } from '../../components/icons';
import { useAppState } from '../../state/store';
import { useUi } from '../../state/ui';
import { fmt, fmtDate } from '../../utils';
import POForm from './POForm';

export default function PurchaseOrders() {
  const { purchases } = useAppState();
  const { openModal } = useUi();

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Inward Purchase Orders</h2>
        <button className="btn primary" onClick={() => openModal(<POForm />, { wide: true })}>
          <IconPlus /> New Purchase Order
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>PO No.</th>
            <th>Date</th>
            <th>Supplier</th>
            <th>Items</th>
            <th className="num">Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {purchases.length ? (
            purchases.map((po) => (
              <tr key={po.id}>
                <td className="mono">{po.no}</td>
                <td>{fmtDate(po.date)}</td>
                <td>{po.supplier.name}</td>
                <td>{po.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</td>
                <td className="num mono">{fmt(po.total)}</td>
                <td>
                  <span className="badge ok">{po.status}</span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="empty">
                No purchase orders yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
