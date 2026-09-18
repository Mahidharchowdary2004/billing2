import { useState } from 'react';
import ModalShell from '../../components/ModalShell';
import { useAppDispatch } from '../../state/store';
import { useUi } from '../../state/ui';
import { Product } from '../../types';

const GST_SLABS = [0, 5, 12, 18, 28];

export default function ProductForm({ product, nextSkuHint }: { product: Product | null; nextSkuHint: string }) {
  const dispatch = useAppDispatch();
  const { closeModal, showToast } = useUi();

  const [form, setForm] = useState<Omit<Product, 'id'>>({
    name: product?.name ?? '',
    sku: product?.sku ?? nextSkuHint,
    barcode: product?.barcode ?? '',
    category: product?.category ?? 'Grocery',
    hsn: product?.hsn ?? '',
    gst: product?.gst ?? 5,
    cost: product?.cost ?? 0,
    wholesale: product?.wholesale ?? 0,
    retail: product?.retail ?? 0,
    cess: product?.cess ?? 0,
    uom: product?.uom ?? 'Pcs',
    pack: product?.pack ?? '',
    stock: product?.stock ?? 0,
    reorder: product?.reorder ?? 10,
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    if (product) {
      dispatch({ type: 'UPDATE_PRODUCT', id: product.id, changes: form });
      showToast('Product updated');
    } else {
      dispatch({ type: 'ADD_PRODUCT', product: form });
      showToast('Product added to catalog');
    }
    closeModal();
  };

  return (
    <ModalShell
      title={product ? 'Edit Product' : 'Add Product — Hybrid Stock Entry'}
      wide
      onClose={closeModal}
      footer={
        <>
          <button className="btn" onClick={closeModal}>
            Cancel
          </button>
          <button className="btn primary" onClick={save}>
            {product ? 'Save changes' : 'Add to catalog'}
          </button>
        </>
      }
    >
      <div className="hint" style={{ marginBottom: 14, color: 'var(--ink-soft)', fontSize: 12 }}>
        Scan a barcode or enter details manually. Every SKU keeps three price tiers and full tax tags.
      </div>
      <div className="row3">
        <div className="field">
          <label>Product name</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Tata Salt 1kg" />
        </div>
        <div className="field">
          <label>SKU code</label>
          <input value={form.sku} onChange={(e) => set('sku', e.target.value)} />
        </div>
        <div className="field">
          <label>Barcode</label>
          <input value={form.barcode} onChange={(e) => set('barcode', e.target.value)} placeholder="Scan or type barcode" />
        </div>
      </div>
      <div className="row3">
        <div className="field">
          <label>Category</label>
          <input value={form.category} onChange={(e) => set('category', e.target.value)} />
        </div>
        <div className="field">
          <label>HSN code</label>
          <input value={form.hsn} onChange={(e) => set('hsn', e.target.value)} placeholder="e.g. 2501" />
        </div>
        <div className="field">
          <label>GST slab</label>
          <select value={form.gst} onChange={(e) => set('gst', Number(e.target.value))}>
            {GST_SLABS.map((g) => (
              <option key={g} value={g}>
                {g}%
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row3">
        <div className="field">
          <label>Cost / purchase price</label>
          <input type="number" value={form.cost} onChange={(e) => set('cost', Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Wholesale rate (B2B)</label>
          <input type="number" value={form.wholesale} onChange={(e) => set('wholesale', Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Retail MRP (B2C)</label>
          <input type="number" value={form.retail} onChange={(e) => set('retail', Number(e.target.value))} />
        </div>
      </div>
      <div className="row3">
        <div className="field">
          <label>CESS % (if any)</label>
          <input type="number" value={form.cess} onChange={(e) => set('cess', Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Unit of measure</label>
          <input value={form.uom} onChange={(e) => set('uom', e.target.value)} />
        </div>
        <div className="field">
          <label>Packaging note</label>
          <input value={form.pack} onChange={(e) => set('pack', e.target.value)} placeholder="e.g. 1 Carton = 24 Pcs" />
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label>Opening stock</label>
          <input type="number" value={form.stock} onChange={(e) => set('stock', Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Reorder / safety level</label>
          <input type="number" value={form.reorder} onChange={(e) => set('reorder', Number(e.target.value))} />
        </div>
      </div>
    </ModalShell>
  );
}
