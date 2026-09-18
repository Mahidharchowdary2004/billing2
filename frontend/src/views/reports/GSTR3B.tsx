import { useAppState } from '../../state/store';
import { fmt } from '../../utils';

export default function GSTR3B() {
  const { invoices, sales, purchases } = useAppState();

  const outputCgst = invoices.reduce((a, i) => a + i.cgst, 0) + sales.reduce((a, s) => a + s.gst / 2, 0);
  const outputSgst = invoices.reduce((a, i) => a + i.sgst, 0) + sales.reduce((a, s) => a + s.gst / 2, 0);
  const outputIgst = invoices.reduce((a, i) => a + i.igst, 0);
  const totalOutput = outputCgst + outputSgst + outputIgst;
  // Approximated ITC from purchases at an effective 9% (mock — purchase orders don't capture explicit GST)
  const itc = purchases.reduce((a, po) => a + po.total, 0) * 0.09;
  const netPayable = Math.max(0, totalOutput - itc);

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>GSTR-3B — Summary Return</h2>
        <span className="hint">Output tax vs Input Tax Credit</span>
      </div>
      <div className="row2">
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>3.1 Outward Taxable Supplies</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>CGST collected</span>
            <span className="mono">{fmt(outputCgst)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>SGST collected</span>
            <span className="mono">{fmt(outputSgst)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>IGST collected</span>
            <span className="mono">{fmt(outputIgst)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', marginTop: 6, borderTop: '1px solid var(--line)', fontWeight: 700 }}>
            <span>Total Output Tax</span>
            <span className="mono">{fmt(totalOutput)}</span>
          </div>
        </div>
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>4. Eligible Input Tax Credit</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>ITC on inward purchases</span>
            <span className="mono">{fmt(itc)}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 8 }}>Estimated from supplier purchase orders at effective rate.</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', marginTop: 20, borderTop: '1px solid var(--line)', fontWeight: 700, fontSize: 15 }}>
            <span>Net Payable</span>
            <span className="mono">{fmt(netPayable)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
