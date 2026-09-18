import ModalShell from '../../components/ModalShell';
import { IconPrint } from '../../components/icons';
import { useUi } from '../../state/ui';
import { B2BInvoice } from '../../types';
import { fmt, fmtDate, printWithPageSize } from '../../utils';

export default function B2BReceiptPreview({ invoice }: { invoice: B2BInvoice }) {
  const { closeModal } = useUi();
  return (
    <ModalShell
      title="Thermal Receipt (B2B)"
      onClose={closeModal}
      noPrintHeader
      headerExtra={
        <button className="btn sm" onClick={() => printWithPageSize('size: 80mm auto; margin: 0;')}>
          <IconPrint /> Print
        </button>
      }
    >
      <div className="receipt-preview">
        <div style={{ textAlign: 'center', fontWeight: 700 }}>VYAPAAR WHOLESALE</div>
        <div style={{ textAlign: 'center' }}>Begum Bazaar, Hyderabad</div>
        <div style={{ textAlign: 'center' }}>GSTIN: 36AAACV0000F1Z1</div>
        <hr />
        <div className="rline">
          <span>Inv No</span>
          <span>{invoice.no}</span>
        </div>
        <div className="rline">
          <span>Date</span>
          <span>{fmtDate(invoice.date)}</span>
        </div>
        <hr />
        <div className="rline">
          <span>Buyer</span>
          <span>{invoice.party.name}</span>
        </div>
        <div className="rline">
          <span>GSTIN</span>
          <span>{invoice.party.gstin}</span>
        </div>
        <hr />
        {invoice.items.map((l, i) => (
          <div key={i}>
            <div className="rline">
              <span>{l.name} (HSN: {l.hsn})</span>
              <span></span>
            </div>
            <div className="rline">
              <span>
                {l.qty} x {fmt(l.rate)}
              </span>
              <span>{fmt(l.qty * l.rate - l.discAmt)}</span>
            </div>
          </div>
        ))}
        <hr />
        <div className="rline">
          <span>Subtotal</span>
          <span>{fmt(invoice.subtotal)}</span>
        </div>
        {invoice.cgst > 0 && (
          <div className="rline">
            <span>CGST</span>
            <span>{fmt(invoice.cgst)}</span>
          </div>
        )}
        {invoice.sgst > 0 && (
          <div className="rline">
            <span>SGST</span>
            <span>{fmt(invoice.sgst)}</span>
          </div>
        )}
        {invoice.igst > 0 && (
          <div className="rline">
            <span>IGST</span>
            <span>{fmt(invoice.igst)}</span>
          </div>
        )}
        {invoice.cess > 0 && (
          <div className="rline">
            <span>CESS</span>
            <span>{fmt(invoice.cess)}</span>
          </div>
        )}
        <div className="rline" style={{ fontWeight: 700, marginTop: 4 }}>
          <span>TOTAL</span>
          <span>{fmt(invoice.total)}</span>
        </div>
        <div className="rline" style={{ marginTop: 4 }}>
          <span>Terms</span>
          <span>{invoice.term}</span>
        </div>
        <hr />
        <div style={{ textAlign: 'center' }}>Thank you for your business!</div>
      </div>
    </ModalShell>
  );
}
