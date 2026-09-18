import { useState } from 'react';
import { IconPlus, IconTrash } from '../../components/icons';
import { useAppDispatch, useAppState } from '../../state/store';
import { useUi } from '../../state/ui';
import { PaymentTerm } from '../../types';
import { fmt, gstSplit, HOME_STATE } from '../../utils';
import PartyForm from './PartyForm';

export default function NewInvoice({ onGenerated }: { onGenerated: () => void }) {
  const { b2bDraft, products, parties } = useAppState();
  const dispatch = useAppDispatch();
  const { openModal } = useUi();

  const [addProductId, setAddProductId] = useState('');
  const [term, setTerm] = useState<PaymentTerm>('Full Paid');
  const [vehicle, setVehicle] = useState('');
  const [rcm, setRcm] = useState<'Yes' | 'No'>('No');
  const [eway, setEway] = useState('');

  const party = b2bDraft.party;
  const interState = !!party && party.state !== HOME_STATE;

  const lines = b2bDraft.items.map((it) => {
    const p = products.find((pp) => pp.id === it.productId)!;
    const base = { productId: p.id, name: p.name, hsn: p.hsn, qty: it.qty, rate: p.wholesale, gst: p.gst, cess: p.cess, discAmt: p.wholesale * it.qty * (it.discPct / 100) };
    return { ...base, ...gstSplit(base, party?.state), discPct: it.discPct };
  });

  const subtotal = lines.reduce((a, l) => a + l.qty * l.rate, 0);
  const discTotal = lines.reduce((a, l) => a + l.discAmt, 0);
  const cgst = lines.reduce((a, l) => a + l.cgst, 0);
  const sgst = lines.reduce((a, l) => a + l.sgst, 0);
  const igst = lines.reduce((a, l) => a + l.igst, 0);
  const cess = lines.reduce((a, l) => a + l.cess, 0);
  const grand = subtotal - discTotal + cgst + sgst + igst + cess;

  const addLine = () => {
    const pid = Number(addProductId);
    if (!pid) return;
    dispatch({ type: 'ADD_B2B_LINE', productId: pid });
    setAddProductId('');
  };

  const generate = () => {
    if (!party || !lines.length) return;
    dispatch({ type: 'GENERATE_B2B_INVOICE', term, vehicle, rcm, ewayBill: eway });
    setVehicle('');
    setEway('');
    setTerm('Full Paid');
    setRcm('No');
    onGenerated();
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
      <div>
        <div className="panel">
          <div className="panel-head">
            <h2>Buyer / GSTIN Validation</h2>
            <span className="hint">B2B Specifics</span>
          </div>
          <div className="row2">
            <div className="field">
              <label>Select registered buyer</label>
              <select value={party?.id ?? ''} onChange={(e) => dispatch({ type: 'SET_B2B_PARTY', partyId: e.target.value ? Number(e.target.value) : null })}>
                <option value="">— choose buyer —</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.state})
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Or add a new buyer</label>
              <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => openModal(<PartyForm />)}>
                <IconPlus /> New buyer
              </button>
            </div>
          </div>
          {party ? (
            <div className="row3">
              <div className="field">
                <label>GSTIN</label>
                <input value={party.gstin} readOnly />
              </div>
              <div className="field">
                <label>State / Place of Supply</label>
                <input value={`${party.state} (${interState ? 'Inter-state' : 'Intra-state'})`} readOnly />
              </div>
              <div className="field">
                <label>Legal trade name</label>
                <input value={party.name} readOnly />
              </div>
            </div>
          ) : (
            <div className="empty">Select a buyer to enable GST tax calculation</div>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Line Items</h2>
            <span className="hint">Wholesale rate applied automatically</span>
          </div>
          <div className="row2" style={{ alignItems: 'end' }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Add product</label>
              <select value={addProductId} onChange={(e) => setAddProductId(e.target.value)}>
                <option value="">— choose product —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {fmt(p.wholesale)}/unit
                  </option>
                ))}
              </select>
            </div>
            <button className="btn primary" style={{ marginBottom: 0 }} onClick={addLine}>
              <IconPlus /> Add line
            </button>
          </div>
          <table style={{ marginTop: 14 }}>
            <thead>
              <tr>
                <th>Item</th>
                <th>HSN</th>
                <th className="num">Qty</th>
                <th className="num">Rate</th>
                <th className="num">Disc %</th>
                <th className="num">Taxable</th>
                <th className="num">Tax</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lines.length ? (
                lines.map((l, i) => (
                  <tr key={i}>
                    <td>{l.name}</td>
                    <td className="mono">{l.hsn}</td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={l.qty}
                        style={{ width: 60, padding: '4px 6px' }}
                        onChange={(e) => dispatch({ type: 'UPDATE_B2B_LINE', index: i, field: 'qty', value: Number(e.target.value) || 1 })}
                      />
                    </td>
                    <td className="num mono">{fmt(l.rate)}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={l.discPct}
                        style={{ width: 55, padding: '4px 6px' }}
                        onChange={(e) => dispatch({ type: 'UPDATE_B2B_LINE', index: i, field: 'discPct', value: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td className="num mono">{fmt(l.taxable)}</td>
                    <td className="num mono">{fmt(l.cgst + l.sgst + l.igst + l.cess)}</td>
                    <td>
                      <button className="btn ghost sm" onClick={() => dispatch({ type: 'REMOVE_B2B_LINE', index: i })}>
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="empty">
                    No items added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Transport &amp; Payment Terms</h2>
          </div>
          <div className="row3">
            <div className="field">
              <label>Payment terms</label>
              <select value={term} onChange={(e) => setTerm(e.target.value as PaymentTerm)}>
                <option>Full Paid</option>
                <option>Partial Advance</option>
                <option>Credit (Khata)</option>
              </select>
            </div>
            <div className="field">
              <label>Vehicle number</label>
              <input value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="TS09AB1234" />
            </div>
            <div className="field">
              <label>Reverse charge?</label>
              <select value={rcm} onChange={(e) => setRcm(e.target.value as 'Yes' | 'No')}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
          </div>
          {grand > 50000 ? (
            <div className="field">
              <label>E-Way Bill reference (mandatory &gt; ₹50,000)</label>
              <input value={eway} onChange={(e) => setEway(e.target.value)} placeholder="EWB123456789" />
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <div className="panel">
          <div className="panel-head">
            <h2>Tax Summary</h2>
            <span className="hint">{interState ? 'IGST (Inter-state)' : 'CGST + SGST (Intra-state)'}</span>
          </div>
          <div style={{ fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span>Subtotal</span>
              <span className="mono">{fmt(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span>Discount</span>
              <span className="mono">− {fmt(discTotal)}</span>
            </div>
            {interState ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span>IGST</span>
                <span className="mono">{fmt(igst)}</span>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                  <span>CGST</span>
                  <span className="mono">{fmt(cgst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                  <span>SGST</span>
                  <span className="mono">{fmt(sgst)}</span>
                </div>
              </>
            )}
            {cess > 0 ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span>CESS</span>
                <span className="mono">{fmt(cess)}</span>
              </div>
            ) : null}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', marginTop: 6, borderTop: '1px solid var(--line)', fontWeight: 700, fontSize: 16 }}>
              <span>Grand Total</span>
              <span className="mono">{fmt(grand)}</span>
            </div>
          </div>
          <button className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} disabled={!party || !lines.length} onClick={generate}>
            Generate Tax Invoice
          </button>
          <button className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => dispatch({ type: 'RESET_B2B_DRAFT' })}>
            Clear draft
          </button>
        </div>
      </div>
    </div>
  );
}
