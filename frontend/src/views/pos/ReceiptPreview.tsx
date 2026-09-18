import ModalShell from '../../components/ModalShell';
import { IconPrint } from '../../components/icons';
import { useUi } from '../../state/ui';
import { POSSale } from '../../types';
import { fmt, fmtDateTime, printWithPageSize } from '../../utils';

export default function ReceiptPreview({ sale }: { sale: POSSale }) {
  const { closeModal } = useUi();
  return (
    <ModalShell
      title="Thermal Receipt"
      onClose={closeModal}
      noPrintHeader
      headerExtra={
        <button className="btn sm" onClick={() => printWithPageSize('size: 80mm auto; margin: 0;')}>
          <IconPrint /> Print
        </button>
      }
    >
      <div className="receipt-preview">
        <div style={{ textAlign: 'center', fontWeight: 700 }}>VYAPAAR RETAIL COUNTER</div>
        <div style={{ textAlign: 'center' }}>Begum Bazaar, Hyderabad</div>
        <div style={{ textAlign: 'center' }}>GSTIN: 36AAACV0000F1Z1</div>
        <hr />
        <div className="rline">
          <span>Bill No</span>
          <span>{sale.no}</span>
        </div>
        <div className="rline">
          <span>Date</span>
          <span>{fmtDateTime(sale.date)}</span>
        </div>
        {sale.customer ? (
          <div className="rline">
            <span>Khata Mobile</span>
            <span>{sale.customer}</span>
          </div>
        ) : null}
        <hr />
        {sale.items.map((l, i) => (
          <div key={i}>
            <div className="rline">
              <span>{l.name}</span>
              <span></span>
            </div>
            <div className="rline">
              <span>
                {l.qty} x {fmt(l.mrp)}
                {l.discPct ? ` (-${l.discPct}%)` : ''}
              </span>
              <span>{fmt(l.net)}</span>
            </div>
          </div>
        ))}
        <hr />
        <div className="rline">
          <span>Subtotal</span>
          <span>{fmt(sale.subtotal)}</span>
        </div>
        <div className="rline">
          <span>Discount</span>
          <span>-{fmt(sale.discount)}</span>
        </div>
        <div className="rline">
          <span>GST (incl.)</span>
          <span>{fmt(sale.gst)}</span>
        </div>
        <div className="rline" style={{ fontWeight: 700 }}>
          <span>TOTAL</span>
          <span>{fmt(sale.total)}</span>
        </div>
        <div className="rline">
          <span>Paid via</span>
          <span>{sale.mode}</span>
        </div>
        <hr />
        <div style={{ textAlign: 'center' }}>Thank you — visit again!</div>
        <div style={{ textAlign: 'center', fontSize: 10 }}>*Slip formatted for 58mm / 80mm rolls*</div>
      </div>
    </ModalShell>
  );
}
