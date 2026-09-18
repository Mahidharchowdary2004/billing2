import { useAppState } from '../../state/store';
import { fmt, fmtInt } from '../../utils';

interface Agg {
  id: number;
  qty: number;
  revenue: number;
}

export default function Profitability() {
  const { invoices, sales, products } = useAppState();

  const map: Record<number, Agg> = {};
  const addLine = (id: number, qty: number, rate: number) => {
    if (!map[id]) map[id] = { id, qty: 0, revenue: 0 };
    map[id].qty += qty;
    map[id].revenue += qty * rate;
  };
  invoices.forEach((inv) => inv.items.forEach((l) => addLine(l.productId, l.qty, l.rate)));
  sales.forEach((s) => s.items.forEach((l) => addLine(l.productId, l.qty, l.rate)));

  const rows = Object.values(map)
    .map((r) => {
      const p = products.find((pp) => pp.id === r.id);
      if (!p) return null;
      const cost = p.cost * r.qty;
      const margin = r.revenue - cost;
      const marginPct = r.revenue ? (margin / r.revenue) * 100 : 0;
      return { name: p.name, category: p.category, qty: r.qty, revenue: r.revenue, cost, margin, marginPct };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.margin - a.margin);

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Item Profitability</h2>
        <span className="hint">Procurement cost vs realized sale price, all channels</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th className="num">Units Sold</th>
            <th className="num">Revenue</th>
            <th className="num">Cost</th>
            <th className="num">Margin</th>
            <th className="num">Margin %</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((r) => (
              <tr key={r.name}>
                <td style={{ fontWeight: 600 }}>{r.name}</td>
                <td>{r.category}</td>
                <td className="num mono">{fmtInt(r.qty)}</td>
                <td className="num mono">{fmt(r.revenue)}</td>
                <td className="num mono">{fmt(r.cost)}</td>
                <td className="num mono">{fmt(r.margin)}</td>
                <td className="num">
                  <span className={`badge ${r.marginPct > 15 ? 'ok' : r.marginPct > 5 ? 'warn' : 'bad'}`}>{r.marginPct.toFixed(1)}%</span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="empty">
                No sales recorded yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
