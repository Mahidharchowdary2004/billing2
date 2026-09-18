import { Router } from 'express';
import { db } from '../store';
import { isToday } from '../utils';
import { PaymentTerm } from '../types';

const router = Router();

const TERMS: PaymentTerm[] = ['Full Paid', 'Partial Advance', 'Credit (Khata)'];

router.get('/dashboard', (_req, res) => {
  const todaySales = db.sales.filter((s) => isToday(s.date));
  const todayInvoices = db.invoices.filter((i) => isToday(i.date));
  const posRevenue = todaySales.reduce((a, s) => a + s.total, 0);
  const b2bRevenue = todayInvoices.reduce((a, i) => a + i.total, 0);
  const lowStock = db.products.filter((p) => p.stock <= p.reorder);
  const creditB2B = db.invoices.filter((i) => i.term !== 'Full Paid').reduce((a, i) => a + i.total, 0);

  const recent = [
    ...db.sales.map((s) => ({ type: 'B2C' as const, no: s.no, date: s.date, amt: s.total, ref: s.mode })),
    ...db.invoices.map((i) => ({ type: 'B2B' as const, no: i.no, date: i.date, amt: i.total, ref: i.party.name })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const paymentTermsMix = TERMS.map((term) => {
    const items = db.invoices.filter((i) => i.term === term);
    return { term, total: items.reduce((a, i) => a + i.total, 0), count: items.length };
  });

  res.json({
    posRevenueToday: posRevenue,
    b2bRevenueToday: b2bRevenue,
    posBillsToday: todaySales.length,
    b2bInvoicesToday: todayInvoices.length,
    lowStock,
    creditB2BOutstanding: creditB2B,
    creditB2BInvoiceCount: db.invoices.filter((i) => i.term !== 'Full Paid').length,
    recent,
    paymentTermsMix,
  });
});

router.get('/daybook', (_req, res) => {
  const todaySales = db.sales.filter((s) => isToday(s.date));
  const todayInvoices = db.invoices.filter((i) => isToday(i.date));
  const cash = todaySales.filter((s) => s.mode === 'Cash').reduce((a, s) => a + s.total, 0);
  const upi = todaySales.filter((s) => s.mode === 'UPI').reduce((a, s) => a + s.total, 0);
  const card = todaySales.filter((s) => s.mode === 'Card' || s.mode === 'Wallet').reduce((a, s) => a + s.total, 0);
  const b2bToday = todayInvoices.reduce((a, i) => a + i.total, 0);

  const rows = [
    ...todaySales.map((s) => ({ type: 'B2C' as const, no: s.no, date: s.date, ref: s.mode, total: s.total })),
    ...todayInvoices.map((i) => ({ type: 'B2B' as const, no: i.no, date: i.date, ref: i.party.name, total: i.total })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({ cash, upi, card, b2bToday, gross: cash + upi + card + b2bToday, rows });
});

router.get('/gstr1', (_req, res) => {
  interface HsnRow {
    hsn: string;
    name: string;
    taxable: number;
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  }
  const map: Record<string, HsnRow> = {};
  db.invoices.forEach((inv) =>
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
  res.json({ rows, totalTax });
});

router.get('/gstr3b', (_req, res) => {
  const outputCgst = db.invoices.reduce((a, i) => a + i.cgst, 0) + db.sales.reduce((a, s) => a + s.gst / 2, 0);
  const outputSgst = db.invoices.reduce((a, i) => a + i.sgst, 0) + db.sales.reduce((a, s) => a + s.gst / 2, 0);
  const outputIgst = db.invoices.reduce((a, i) => a + i.igst, 0);
  const totalOutput = outputCgst + outputSgst + outputIgst;
  const itc = db.purchases.reduce((a, po) => a + po.total, 0) * 0.09;
  const netPayable = Math.max(0, totalOutput - itc);
  res.json({ outputCgst, outputSgst, outputIgst, totalOutput, itc, netPayable });
});

router.get('/profitability', (_req, res) => {
  interface Agg {
    id: number;
    qty: number;
    revenue: number;
  }
  const map: Record<number, Agg> = {};
  const addLine = (id: number, qty: number, rate: number) => {
    if (!map[id]) map[id] = { id, qty: 0, revenue: 0 };
    map[id].qty += qty;
    map[id].revenue += qty * rate;
  };
  db.invoices.forEach((inv) => inv.items.forEach((l) => addLine(l.productId, l.qty, l.rate)));
  db.sales.forEach((s) => s.items.forEach((l) => addLine(l.productId, l.qty, l.rate)));

  const rows = Object.values(map)
    .map((r) => {
      const p = db.products.find((pp) => pp.id === r.id);
      if (!p) return null;
      const cost = p.cost * r.qty;
      const margin = r.revenue - cost;
      const marginPct = r.revenue ? (margin / r.revenue) * 100 : 0;
      return { name: p.name, category: p.category, qty: r.qty, revenue: r.revenue, cost, margin, marginPct };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.margin - a.margin);

  res.json({ rows });
});

export default router;
