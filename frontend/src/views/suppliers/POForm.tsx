import { useState } from 'react';
import ModalShell from '../../components/ModalShell';
import { IconPlus } from '../../components/icons';
import { useAppDispatch, useAppState } from '../../state/store';
import { useUi } from '../../state/ui';
import { fmt } from '../../utils';

interface DraftLine {
  productId: number;
  qty: number;
}

export default function POForm() {
  const { suppliers, products } = useAppState();
  const dispatch = useAppDispatch();
  const { closeModal, showToast } = useUi();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? 0);
  const [productId, setProductId] = useState(products[0]?.id ?? 0);
  const [qty, setQty] = useState(50);
  const [lines, setLines] = useState<DraftLine[]>([]);

  const addLine = () => {
    if (!productId) return;
    setLines((ls) => [...ls, { productId, qty }]);
  };

  const submit = () => {
    if (!lines.length) {
      showToast('Add at least one line');
      return;
    }
    dispatch({ type: 'SUBMIT_PO', supplierId, items: lines });
    showToast('Stock incremented from purchase order');
    closeModal();
  };

  return (
    <ModalShell
      title="New Purchase Order / Inward Bill"
      wide
      onClose={closeModal}
      footer={
        <>
          <button className="btn" onClick={closeModal}>
            Cancel
          </button>
          <button className="btn primary" onClick={submit}>
            Submit &amp; Increment Stock
          </button>
        </>
      }
    >
      <div className="field">
        <label>Supplier</label>
        <select value={supplierId} onChange={(e) => setSupplierId(Number(e.target.value))}>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="row3" style={{ alignItems: 'end' }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Product</label>
          <select value={productId} onChange={(e) => setProductId(Number(e.target.value))}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Quantity</label>
          <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value) || 1)} />
        </div>
        <button className="btn" style={{ marginBottom: 0 }} onClick={addLine}>
          <IconPlus /> Add line
        </button>
      </div>
      <table style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>Product</th>
            <th className="num">Qty</th>
            <th className="num">Rate (cost)</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.length ? (
            lines.map((l, i) => {
              const p = products.find((pp) => pp.id === l.productId)!;
              return (
                <tr key={i}>
                  <td>{p.name}</td>
                  <td className="num">{l.qty}</td>
                  <td className="num mono">{fmt(p.cost)}</td>
                  <td className="num mono">{fmt(p.cost * l.qty)}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} className="empty">
                No lines yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </ModalShell>
  );
}
