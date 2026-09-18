import { useEffect, useMemo, useRef, useState } from 'react';
import { IconScan, IconTrash } from '../../components/icons';
import { useAppDispatch, useAppState } from '../../state/store';
import { useUi } from '../../state/ui';
import { PaymentMode } from '../../types';
import { fmt } from '../../utils';
import ReceiptPreview from './ReceiptPreview';

function UpiQr() {
  const cells = useMemo(() => Array.from({ length: 36 }, () => Math.random() > 0.42), []);
  return (
    <div className="field">
      <label>Scan to pay via UPI</label>
      <div className="qr-box">
        {cells.map((visible, i) => (
          <div key={i} style={{ opacity: visible ? 1 : 0 }} />
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-soft)', marginTop: 6 }}>store@upi · dynamic QR (demo)</div>
    </div>
  );
}

export default function POSView() {
  const { products, cart, sales, lastSaleId } = useAppState();
  const dispatch = useAppDispatch();
  const { openModal, showToast } = useUi();

  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<PaymentMode>('Cash');
  const [cash, setCash] = useState('');
  const [phone, setPhone] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const results = search
    ? products.filter(
        (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search) || p.sku.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const lines = cart.map((c) => {
    const p = products.find((pp) => pp.id === c.productId)!;
    const gross = p.retail * c.qty;
    const disc = gross * (c.discPct / 100);
    return { p, qty: c.qty, discPct: c.discPct, net: gross - disc };
  });
  const subtotal = lines.reduce((a, l) => a + l.p.retail * l.qty, 0);
  const discount = lines.reduce((a, l) => a + l.p.retail * l.qty * (l.discPct / 100), 0);
  const netTotal = subtotal - discount;
  const gstIncluded = lines.reduce((a, l) => a + l.net * (l.p.gst / (100 + l.p.gst)), 0);
  const changeDue = Math.max(0, (Number(cash) || 0) - netTotal);

  const addToCart = (id: number) => {
    dispatch({ type: 'ADD_TO_CART', productId: id });
    setSearch('');
    showToast('Added to cart');
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  const onEnter = () => {
    const exact = products.find((p) => p.barcode === search.trim());
    if (exact) addToCart(exact.id);
  };

  const handled = useRef<number | null>(null);
  useEffect(() => {
    if (lastSaleId && handled.current !== lastSaleId) {
      handled.current = lastSaleId;
      const sale = sales.find((s) => s.id === lastSaleId);
      if (sale) openModal(<ReceiptPreview sale={sale} />);
    }
  }, [lastSaleId, sales, openModal]);

  const completeSale = () => {
    if (!lines.length) return;
    dispatch({ type: 'COMPLETE_SALE', mode, customer: phone });
    setCash('');
    setPhone('');
    showToast('Sale completed');
  };

  return (
    <div className="pos-grid">
      <div>
        <div className="panel">
          <div className="panel-head">
            <h2>
              <IconScan /> Scan or Search Item
            </h2>
            <span className="hint">Continuous barcode input — no mouse needed</span>
          </div>
          <input
            ref={searchInputRef}
            autoFocus
            placeholder="Scan barcode, or type product name / SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onEnter();
            }}
          />
          {search ? (
            <div style={{ marginTop: 10, maxHeight: 280, overflowY: 'auto' }}>
              {results.length ? (
                results.map((p) => (
                  <div
                    key={p.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 4px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                    onClick={() => addToCart(p.id)}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                        {p.sku} · {p.barcode} · Stock {p.stock}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono" style={{ fontWeight: 600 }}>
                        {fmt(p.retail)}
                      </div>
                      <button className="btn primary sm" style={{ marginTop: 3 }}>
                        Add
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty">No matching product</div>
              )}
            </div>
          ) : null}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Cart</h2>
            <span className="hint">
              {lines.length} item{lines.length !== 1 ? 's' : ''}
            </span>
          </div>
          {lines.length ? (
            lines.map((l, i) => (
              <div className="cart-line" key={l.p.id}>
                <div className="nm">
                  <div>{l.p.name}</div>
                  <div className="sub">
                    {fmt(l.p.retail)} × {l.qty} · GST {l.p.gst}% incl.
                  </div>
                </div>
                <div className="qty-ctl">
                  <button onClick={() => dispatch({ type: 'CHANGE_CART_QTY', index: i, delta: -1 })}>−</button>
                  <span>{l.qty}</span>
                  <button onClick={() => dispatch({ type: 'CHANGE_CART_QTY', index: i, delta: 1 })}>+</button>
                </div>
                <div style={{ width: 60 }}>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={l.discPct}
                    style={{ padding: '4px 6px', fontSize: '11.5px' }}
                    title="Discount %"
                    onChange={(e) => dispatch({ type: 'SET_CART_DISC', index: i, value: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="mono" style={{ width: 74, textAlign: 'right' }}>
                  {fmt(l.net)}
                </div>
                <button className="btn ghost sm" onClick={() => dispatch({ type: 'REMOVE_FROM_CART', index: i })}>
                  <IconTrash />
                </button>
              </div>
            ))
          ) : (
            <div className="empty">Cart is empty — scan an item to begin</div>
          )}
        </div>
      </div>

      <div>
        <div className="panel">
          <div className="panel-head">
            <h2>Checkout</h2>
          </div>
          <div className="field">
            <label>Customer Khata (optional)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Lookup by mobile number" />
          </div>
          <div style={{ fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span>Subtotal</span>
              <span className="mono">{fmt(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span>Discount</span>
              <span className="mono">− {fmt(discount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span>GST (included in MRP)</span>
              <span className="mono">{fmt(gstIncluded)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', marginTop: 6, borderTop: '1px solid var(--line)', fontWeight: 700, fontSize: 18 }}>
              <span>Payable</span>
              <span className="mono">{fmt(netTotal)}</span>
            </div>
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Payment mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as PaymentMode)}>
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Wallet</option>
            </select>
          </div>
          {mode === 'UPI' ? (
            <UpiQr />
          ) : mode === 'Cash' ? (
            <div className="field">
              <label>Cash tendered</label>
              <input type="number" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="Amount received" />
              <div style={{ marginTop: 6, fontSize: '12.5px', color: 'var(--ink-soft)' }}>Change due: {fmt(changeDue)}</div>
            </div>
          ) : null}
          <button className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} disabled={!lines.length} onClick={completeSale}>
            Complete Sale &amp; Print Slip
          </button>
        </div>
      </div>
    </div>
  );
}
