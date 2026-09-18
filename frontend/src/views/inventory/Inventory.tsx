import { useState } from 'react';
import { useAppState } from '../../state/store';
import { useUi } from '../../state/ui';
import { fmt } from '../../utils';
import { IconPlus } from '../../components/icons';
import ProductForm from './ProductForm';

export default function Inventory() {
  const { products } = useAppState();
  const { openModal } = useUi();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low'>('all');

  let list = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search)
  );
  if (filter === 'low') list = list.filter((p) => p.stock <= p.reorder);

  const openForm = (product: (typeof products)[number] | null) => {
    openModal(<ProductForm product={product} nextSkuHint={`SKU-${1000 + products.length + 1}`} />, { wide: true });
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Product Catalog</h2>
        <button className="btn primary" onClick={() => openForm(null)}>
          <IconPlus /> Add Product
        </button>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          style={{ maxWidth: 280 }}
          placeholder="Search by name, SKU or barcode…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select style={{ maxWidth: 180 }} value={filter} onChange={(e) => setFilter(e.target.value as 'all' | 'low')}>
          <option value="all">All items</option>
          <option value="low">Below reorder level</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-soft)', alignSelf: 'center' }}>
          {list.length} of {products.length} SKUs
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>SKU / Barcode</th>
            <th>Product</th>
            <th>HSN</th>
            <th>GST</th>
            <th className="num">Cost</th>
            <th className="num">Wholesale</th>
            <th className="num">Retail MRP</th>
            <th>UOM</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list.length ? (
            list.map((p) => {
              const low = p.stock <= p.reorder;
              const pct = Math.min(100, Math.round((p.stock / (p.reorder * 2)) * 100));
              return (
                <tr key={p.id}>
                  <td>
                    <div className="mono" style={{ fontSize: '11.5px' }}>
                      {p.sku}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--ink-soft)' }}>{p.barcode}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                      {p.category} · {p.pack}
                    </div>
                  </td>
                  <td className="mono">{p.hsn}</td>
                  <td>
                    {p.gst}%
                    {p.cess ? <div style={{ fontSize: 10, color: 'var(--ink-soft)' }}>+{p.cess}% cess</div> : null}
                  </td>
                  <td className="num">{fmt(p.cost)}</td>
                  <td className="num">{fmt(p.wholesale)}</td>
                  <td className="num">{fmt(p.retail)}</td>
                  <td>{p.uom}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="mono" style={{ fontSize: 12 }}>
                        {p.stock}
                      </span>
                      <div className={`stock-bar ${low ? 'low' : ''}`}>
                        <i style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    {low ? (
                      <span className="badge bad" style={{ marginTop: 3 }}>
                        Reorder
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <button className="btn ghost sm" onClick={() => openForm(p)}>
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={10} className="empty">
                No products match your search
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
