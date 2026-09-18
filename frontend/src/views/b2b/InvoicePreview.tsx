import ModalShell from '../../components/ModalShell';
import { IconPrint } from '../../components/icons';
import { useUi } from '../../state/ui';
import { B2BInvoice } from '../../types';
import { HOME_STATE } from '../../utils';
import { fmt, fmtDate, printWithPageSize } from '../../utils';

export default function InvoicePreview({ invoice }: { invoice: B2BInvoice }) {
  const { closeModal } = useUi();
  const inter = invoice.party.state !== HOME_STATE;

  return (
    <ModalShell
      title="Tax Invoice Preview"
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
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18 }}>Vyapaar Wholesale Traders</div>
            <div style={{ fontSize: '11.5px', color: '#555' }}>
              12-4-45, Begum Bazaar, Hyderabad, Telangana – 500012
              <br />
              GSTIN: 36AAACV0000F1Z1 · Ph: 040-23456789
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>TAX INVOICE</div>
            <div style={{ fontSize: '11.5px' }}>
              No: <b>{invoice.no}</b>
            </div>
            <div style={{ fontSize: '11.5px' }}>Date: {fmtDate(invoice.date)}</div>
            {invoice.rcm === 'Yes' ? <div style={{ fontSize: 11, color: '#B23A24' }}>Reverse Charge Applicable</div> : null}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Bill To</div>
            <div style={{ fontWeight: 600 }}>{invoice.party.name}</div>
            <div style={{ fontSize: '11.5px' }}>{invoice.party.address}</div>
            <div style={{ fontSize: '11.5px' }}>
              GSTIN: {invoice.party.gstin} · State: {invoice.party.state}
            </div>
          </div>
          <div style={{ fontSize: '11.5px' }}>
            <div>
              <b>Place of Supply:</b> {invoice.party.state} ({inter ? 'Inter-state' : 'Intra-state'})
            </div>
            <div>
              <b>Payment Terms:</b> {invoice.term}
            </div>
            {invoice.vehicle ? (
              <div>
                <b>Vehicle No.:</b> {invoice.vehicle}
              </div>
            ) : null}
            {invoice.ewayBill ? (
              <div>
                <b>E-Way Bill:</b> {invoice.ewayBill}
              </div>
            ) : null}
          </div>
        </div>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>HSN</th>
              <th className="num">Qty</th>
              <th className="num">Rate</th>
              <th className="num">Taxable</th>
              {inter ? <th className="num">IGST</th> : (
                <>
                  <th className="num">CGST</th>
                  <th className="num">SGST</th>
                </>
              )}
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((l, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{l.name}</td>
                <td>{l.hsn}</td>
                <td className="num">{l.qty}</td>
                <td className="num">{fmt(l.rate)}</td>
                <td className="num">{fmt(l.taxable)}</td>
                {inter ? (
                  <td className="num">{fmt(l.igst)}</td>
                ) : (
                  <>
                    <td className="num">{fmt(l.cgst)}</td>
                    <td className="num">{fmt(l.sgst)}</td>
                  </>
                )}
                <td className="num">{fmt(l.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <div style={{ width: 240, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span>Taxable Value</span>
              <span>{fmt(invoice.subtotal)}</span>
            </div>
            {inter ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                <span>IGST</span>
                <span>{fmt(invoice.igst)}</span>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span>CGST</span>
                  <span>{fmt(invoice.cgst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span>SGST</span>
                  <span>{fmt(invoice.sgst)}</span>
                </div>
              </>
            )}
            {invoice.cess > 0 ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                <span>CESS</span>
                <span>{fmt(invoice.cess)}</span>
              </div>
            ) : null}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #333', fontWeight: 700 }}>
              <span>Grand Total</span>
              <span>{fmt(invoice.total)}</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 20, fontSize: '10.5px', color: '#777', borderTop: '1px solid #ddd', paddingTop: 10 }}>
          This is a system-generated tax invoice under CGST/SGST/IGST Act. Subject to Hyderabad jurisdiction.
        </div>
      </div>
    </ModalShell>
  );
}
