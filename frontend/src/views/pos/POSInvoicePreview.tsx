import ModalShell from '../../components/ModalShell';
import { IconPrint } from '../../components/icons';
import { useUi } from '../../state/ui';
import { POSSale } from '../../types';
import { fmt, fmtDate, printWithPageSize } from '../../utils';

export default function POSInvoicePreview({ sale }: { sale: POSSale }) {
  const { closeModal } = useUi();

  return (
    <ModalShell
      title="Tax Invoice Preview (POS)"
      wide
      onClose={closeModal}
      noPrintHeader
      headerExtra={
        <button className="btn sm" onClick={() => printWithPageSize('size: A4 portrait; margin: 10mm;')}>
          <IconPrint /> Print A4
        </button>
      }
    >
      <div className="invoice-preview">
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #222', paddingBottom: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18 }}>Vyapaar Retail Counter</div>
            <div style={{ fontSize: '11.5px', color: '#555' }}>
              12-4-45, Begum Bazaar, Hyderabad, Telangana – 500012
              <br />
              GSTIN: 36AAACV0000F1Z1 · Ph: 040-23456789
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>RETAIL INVOICE</div>
            <div style={{ fontSize: '11.5px' }}>
              No: <b>{sale.no}</b>
            </div>
            <div style={{ fontSize: '11.5px' }}>Date: {fmtDate(sale.date)}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Bill To</div>
            <div style={{ fontWeight: 600 }}>Cash Customer</div>
            {sale.customer && <div style={{ fontSize: '11.5px' }}>Mobile: {sale.customer}</div>}
          </div>
          <div style={{ fontSize: '11.5px' }}>
            <div>
              <b>Payment Mode:</b> {sale.mode}
            </div>
          </div>
        </div>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th className="num">Qty</th>
              <th className="num">MRP</th>
              <th className="num">Discount</th>
              <th className="num">GST</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((l, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{l.name}</td>
                <td className="num">{l.qty}</td>
                <td className="num">{fmt(l.mrp)}</td>
                <td className="num">{l.discPct ? `${l.discPct}%` : '-'}</td>
                <td className="num">{l.gst}%</td>
                <td className="num">{fmt(l.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <div style={{ width: 240, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span>Subtotal</span>
              <span>{fmt(sale.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span>Discount</span>
              <span>-{fmt(sale.discount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span>GST (Included)</span>
              <span>{fmt(sale.gst)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #333', fontWeight: 700 }}>
              <span>Grand Total</span>
              <span>{fmt(sale.total)}</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 20, fontSize: '10.5px', color: '#777', borderTop: '1px solid #ddd', paddingTop: 10 }}>
          This is a computer-generated invoice.
        </div>
      </div>
    </ModalShell>
  );
}
