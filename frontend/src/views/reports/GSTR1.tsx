import { useAppState } from '../../state/store';
import { useUi } from '../../state/ui';
import { fmt } from '../../utils';

interface HsnRow {
  hsn: string;
  name: string;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
}

export default function GSTR1() {
  const { invoices } = useAppState();
  const { showToast } = useUi();

  const map: Record<string, HsnRow> = {};
  invoices.forEach((inv) =>
    inv.items.forEach((l) => {
      if (!map[l.hsn]) map[l.hsn] = { hsn: l.hsn, name: l.name, taxable: 0, cgst: 0, sgst: 0, igst: 0, cess: 0 };
      map[l.hsn].taxable += l.taxable;
      map[l.hsn].cgst += l.cgst;
      map[l.hsn].sgst += l.sgst;
      map[l.hsn].igst += l.igst;
      map[l.hsn].cess += l.cess;
    })
  );
  const rows = Object.values(map);
  const totalTax = rows.reduce((a, r) => a + r.cgst + r.sgst + r.igst + r.cess, 0);

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>GSTR-1 — HSN-wise Outward Supply Summary</h2>
        <span className="hint">B2B invoices, current period</span>
        <button className="btn sm" onClick={() => showToast('Export queued (demo)')}>
          Export CSV
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>HSN Code</th>
            <th>Description</th>
            <th className="num">Taxable Value</th>
            <th className="num">CGST</th>
            <th className="num">SGST</th>
            <th className="num">IGST</th>
            <th className="num">CESS</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((r) => (
              <tr key={r.hsn}>
                <td className="mono">{r.hsn}</td>
                <td>{r.name}</td>
                <td className="num mono">{fmt(r.taxable)}</td>
                <td className="num mono">{fmt(r.cgst)}</td>
                <td className="num mono">{fmt(r.sgst)}</td>
                <td className="num mono">{fmt(r.igst)}</td>
                <td className="num mono">{fmt(r.cess)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="empty">
                No B2B outward supplies recorded
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div style={{ textAlign: 'right', marginTop: 10, fontWeight: 600 }}>
        Total Tax Liability: <span className="mono">{fmt(totalTax)}</span>
      </div>
    </div>
  );
}
