import ModalShell from '../../components/ModalShell';
import { IconPrint } from '../../components/icons';
import { useUi } from '../../state/ui';
import { B2BInvoice } from '../../types';
import { HOME_STATE } from '../../utils';
import { fmt, fmtDate, printWithPageSize, amountToWords } from '../../utils';

export default function InvoicePreview({ invoice }: { invoice: B2BInvoice }) {
  const { closeModal } = useUi();
  const inter = invoice.party.state !== HOME_STATE;

  const totalQty = invoice.items.reduce((a, b) => a + b.qty, 0);
  const totalTaxAmt = invoice.cgst + invoice.sgst + invoice.igst + invoice.cess;

  return (
    <ModalShell
      title="Tax Invoice Preview"
      wide
      onClose={closeModal}
      noPrintHeader
      headerExtra={
        <button className="btn sm" onClick={() => printWithPageSize('size: A4 portrait; margin: 5mm;')}>
          <IconPrint /> Print A4
        </button>
      }
    >
      <div className="invoice-preview" style={{ fontFamily: 'Arial, sans-serif', color: '#000', backgroundColor: '#fff', padding: '10px' }}>
        <style>
          {`
            .inv-table { width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 11px; }
            .inv-table th, .inv-table td { border: 1px solid #000; padding: 4px; }
            .inv-table-no-border-bottom td { border-bottom: none; border-top: none; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .fw-bold { font-weight: bold; }
            .inv-container { border: 1px solid #000; font-size: 11px; margin-bottom: 20px; color: #000; }
            .border-bottom { border-bottom: 1px solid #000; }
            .border-right { border-right: 1px solid #000; }
            .border-top { border-top: 1px solid #000; }
            .p-1 { padding: 4px; }
            .p-2 { padding: 8px; }
            .flex-between { display: flex; justify-content: space-between; }
            .flex-center { display: flex; justify-content: center; }
          `}
        </style>
        
        <div className="inv-container">
          <div className="text-center p-1 border-bottom" style={{ textDecoration: 'underline', fontSize: 11 }}>
            SUBJECT TO HYDERABAD, TELANGANA JURISDICTION
          </div>
          
          <div className="flex-between p-2 border-bottom">
            <div style={{ width: '30%', lineHeight: '1.4' }}>
              <div>e-Way Bill No. : {invoice.ewayBill || ''}</div>
              <div>Invoice No : {invoice.no}</div>
              <div>Ref. No. : </div>
            </div>
            <div className="text-center" style={{ width: '40%', lineHeight: '1.4' }}>
              <div className="fw-bold" style={{ fontSize: 14 }}>M/S GANESH BHANDAR 2023-24 NEW</div>
              <div>UDALA</div>
              <div>GSTIN/UIN: 21ADOPM6908J1ZB</div>
              <div>State Name : Odisha, Code : 21</div>
              <div>Contact : 7992820351,067922291077</div>
            </div>
            <div className="text-right" style={{ width: '30%', lineHeight: '1.4' }}>
              <div className="fw-bold">e-Invoice</div>
              <div>Dated {fmtDate(invoice.date)}</div>
              <div style={{ marginTop: 8 }}>
                 <img src={"https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=" + invoice.no} alt="QR Code" style={{ width: 80, height: 80 }} />
              </div>
            </div>
          </div>

          <div className="text-center fw-bold p-1 border-bottom" style={{ fontSize: 13 }}>
            TAX INVOICE NEW
          </div>

          <div className="flex-between p-2 border-bottom">
            <div style={{ width: '50%', lineHeight: '1.4' }}>
              <div style={{ display: 'flex' }}><div style={{ width: 60 }}>IRN</div>: </div>
              <div style={{ display: 'flex' }}><div style={{ width: 60 }}>Ack No.</div>: </div>
              <div style={{ display: 'flex' }}><div style={{ width: 60 }}>Ack Date</div>: {fmtDate(invoice.date)}</div>
            </div>
            <div style={{ width: '50%', textAlign: 'center', lineHeight: '1.4' }}>
              <div>Party : <span className="fw-bold">{invoice.party.name}</span></div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{invoice.party.address}</div>
              <div>MOB-</div>
              <div>GSTIN/UIN : {invoice.party.gstin}</div>
              <div>State Name : {invoice.party.state}</div>
              <div>Contact : </div>
            </div>
          </div>

          <table className="inv-table" style={{ border: 'none', borderBottom: '1px solid #000' }}>
            <thead>
              <tr>
                <th style={{ width: '4%' }}>Sl<br/>No.</th>
                <th style={{ width: '30%' }}>Description of Goods</th>
                <th style={{ width: '10%' }}>HSN/SAC</th>
                <th style={{ width: '8%' }}>GST<br/>Rate</th>
                <th style={{ width: '10%' }}>Quantity</th>
                <th style={{ width: '10%' }}>Rate<br/>(Incl. of Tax)</th>
                <th style={{ width: '10%' }}>Rate</th>
                <th style={{ width: '4%' }}>per</th>
                <th style={{ width: '6%' }}>Disc. %</th>
                <th style={{ width: '14%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((l, i) => (
                <tr key={i} className="inv-table-no-border-bottom" style={{ verticalAlign: 'top' }}>
                  <td className="text-center border-right">{i + 1}</td>
                  <td className="border-right fw-bold">{l.name}</td>
                  <td className="text-center border-right">{l.hsn}</td>
                  <td className="text-center border-right">18 %</td>
                  <td className="text-center fw-bold border-right">{l.qty} PCS</td>
                  <td className="text-right border-right"></td>
                  <td className="text-right border-right">{fmt(l.rate).replace('₹', '')}</td>
                  <td className="text-center border-right">PCS</td>
                  <td className="text-center border-right"></td>
                  <td className="text-right fw-bold">{fmt(l.total).replace('₹', '')}</td>
                </tr>
              ))}
              <tr className="inv-table-no-border-bottom">
                <td className="border-right"></td>
                <td className="border-right">
                   <div style={{ textAlign: 'right', marginTop: 10, fontWeight: 'bold', paddingRight: 20 }}>
                     {inter ? <div>IGST</div> : <div>CGST<br/>SGST</div>}
                     <div>Rounded Off</div>
                   </div>
                </td>
                <td className="border-right"></td>
                <td className="border-right"></td>
                <td className="border-right"></td>
                <td className="border-right"></td>
                <td className="border-right"></td>
                <td className="border-right"></td>
                <td className="border-right"></td>
                <td className="text-right fw-bold">
                  <div style={{ marginTop: 10 }}>
                    {inter ? (
                        <div>{fmt(invoice.igst).replace('₹', '')}</div>
                    ) : (
                        <>
                          <div>{fmt(invoice.cgst).replace('₹', '')}</div>
                          <div>{fmt(invoice.sgst).replace('₹', '')}</div>
                        </>
                    )}
                    <div>(-)0.00</div>
                  </div>
                </td>
              </tr>
              <tr className="inv-table-no-border-bottom">
                <td className="border-right" style={{ height: 100 }}></td>
                <td className="border-right"></td>
                <td className="border-right"></td>
                <td className="border-right"></td>
                <td className="border-right"></td>
                <td className="border-right"></td>
                <td className="border-right"></td>
                <td className="border-right"></td>
                <td className="border-right"></td>
                <td></td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="text-right fw-bold">Total</td>
                <td className="text-center fw-bold">{totalQty}.00 PCS</td>
                <td colSpan={4}></td>
                <td className="text-right fw-bold">₹ {fmt(invoice.total).replace('₹', '')}</td>
              </tr>
            </tfoot>
          </table>

          <div className="p-1" style={{ fontSize: 10, textAlign: 'right' }}>E. & O.E</div>

          <div className="p-2 border-bottom">
            <div style={{ fontSize: 10 }}>Amount Chargeable (in words)</div>
            <div className="fw-bold">{amountToWords(invoice.total)}</div>
            <div style={{ marginTop: 8, fontSize: 10 }}>
              <div style={{ display: 'flex' }}><div style={{ width: 100 }}>Prev.Balance :</div><div className="fw-bold"> 0.00 Cr</div></div>
              <div style={{ display: 'flex' }}><div style={{ width: 100 }}>Bill Amt. :</div><div className="fw-bold"> {fmt(invoice.total).replace('₹', '')} Dr</div></div>
              <div style={{ display: 'flex' }}><div style={{ width: 100 }}>Net Balance :</div><div className="fw-bold"> {fmt(invoice.total).replace('₹', '')} Dr</div></div>
            </div>
          </div>

          <table className="inv-table" style={{ border: 'none', borderBottom: '1px solid #000', margin: '6px auto', width: '99%' }}>
            <thead>
              <tr>
                <th rowSpan={2} style={{ width: '20%' }}>Taxable<br/>Value</th>
                {inter ? <th colSpan={2} style={{ width: '60%' }}>IGST</th> : (
                    <>
                      <th colSpan={2} style={{ width: '30%' }}>CGST</th>
                      <th colSpan={2} style={{ width: '30%' }}>SGST/UTGST</th>
                    </>
                )}
                <th rowSpan={2} style={{ width: '20%' }}>Total<br/>Tax Amount</th>
              </tr>
              <tr>
                <th>Rate</th>
                <th>Amount</th>
                {!inter && (
                    <>
                      <th>Rate</th>
                      <th>Amount</th>
                    </>
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-right">{fmt(invoice.subtotal).replace('₹', '')}</td>
                {inter ? (
                    <>
                      <td className="text-center">18%</td>
                      <td className="text-right">{fmt(invoice.igst).replace('₹', '')}</td>
                    </>
                ) : (
                    <>
                      <td className="text-center">9%</td>
                      <td className="text-right">{fmt(invoice.cgst).replace('₹', '')}</td>
                      <td className="text-center">9%</td>
                      <td className="text-right">{fmt(invoice.sgst).replace('₹', '')}</td>
                    </>
                )}
                <td className="text-right">{fmt(totalTaxAmt).replace('₹', '')}</td>
              </tr>
              <tr className="fw-bold">
                <td className="text-right">Total: {fmt(invoice.subtotal).replace('₹', '')}</td>
                {inter ? (
                    <>
                      <td></td>
                      <td className="text-right">{fmt(invoice.igst).replace('₹', '')}</td>
                    </>
                ) : (
                    <>
                      <td></td>
                      <td className="text-right">{fmt(invoice.cgst).replace('₹', '')}</td>
                      <td></td>
                      <td className="text-right">{fmt(invoice.sgst).replace('₹', '')}</td>
                    </>
                )}
                <td className="text-right">{fmt(totalTaxAmt).replace('₹', '')}</td>
              </tr>
            </tbody>
          </table>

          <div className="p-2 border-bottom">
            <div style={{ fontSize: 10 }}>Tax Amount (in words) : <span className="fw-bold">{amountToWords(totalTaxAmt)}</span></div>
            <div style={{ fontSize: 10, marginTop: 4 }}>Remarks:</div>
            <div style={{ fontSize: 11, marginTop: 2 }}>DESPATCHED {fmtDate(invoice.date)}</div>
          </div>

          <div className="p-2 flex-between" style={{ alignItems: 'flex-start' }}>
            <div style={{ width: '50%' }}>
              <div style={{ textDecoration: 'underline', fontSize: 10, marginBottom: 4 }}>Declaration</div>
              <div style={{ fontSize: 10, lineHeight: '1.3' }}>
                We declare that this invoice shows the actual price of the goods<br/>
                described and that all particulars are true and correct. PLEASE<br/>
                CONTACT 7992820351 FOR ANY QUERY/ISSUES.
              </div>
            </div>
            <div style={{ width: '50%', fontSize: 10 }}>
              <div style={{ marginBottom: 4 }}>Company's Bank Details</div>
              <div style={{ display: 'flex' }}><div style={{ width: 100 }}>Bank Name</div>: <span className="fw-bold ml-1">STATE BANK OF INDIA-5344</span></div>
              <div style={{ display: 'flex' }}><div style={{ width: 100 }}>A/c No.</div>: <span className="fw-bold ml-1">41173135344</span></div>
              <div style={{ display: 'flex' }}><div style={{ width: 100 }}>Branch & IFS Code</div>: <span className="fw-bold ml-1">BARIPADA & SBIN0000027</span></div>
              
              <div className="text-right" style={{ marginTop: 30 }}>
                <div className="fw-bold">for M/S GANESH BHANDAR 2023-24 NEW</div>
                <div style={{ height: 40 }}></div>
                <div>Authorized Signatory</div>
              </div>
            </div>
          </div>
          
          <div className="text-center p-1 border-top" style={{ fontSize: 10 }}>
            This is a Computer Generated Invoice
          </div>

        </div>
      </div>
    </ModalShell>
  );
}
