import { B2BInvoice, B2BParty, POSSale, Product, Purchase, Supplier } from '../types';
import { gstSplit } from '../utils';

let idCounter = 1000;
const nextId = () => ++idCounter;

export const PRODUCTS_SEED: Product[] = [
  { id: nextId(), sku: 'SKU-1001', barcode: '8901234560015', name: 'Tata Salt 1kg', category: 'Grocery', cost: 18, wholesale: 21, retail: 26, gst: 5, cess: 0, hsn: '2501', uom: 'Bag', pack: '1 Bag = 1 Kg', stock: 340, reorder: 80 },
  { id: nextId(), sku: 'SKU-1002', barcode: '8901234560022', name: 'Fortune Sunflower Oil 1L', category: 'Grocery', cost: 118, wholesale: 132, retail: 149, gst: 5, cess: 0, hsn: '1512', uom: 'Pouch', pack: '1 Carton = 12 Pouches', stock: 64, reorder: 60 },
  { id: nextId(), sku: 'SKU-1003', barcode: '8901234560039', name: 'Aashirvaad Atta 5kg', category: 'Grocery', cost: 210, wholesale: 232, retail: 259, gst: 5, cess: 0, hsn: '1101', uom: 'Bag', pack: '1 Bag = 5 Kg', stock: 52, reorder: 40 },
  { id: nextId(), sku: 'SKU-1004', barcode: '8901234560046', name: 'Maggi Noodles 70g', category: 'Snacks', cost: 11, wholesale: 12.5, retail: 14, gst: 12, cess: 0, hsn: '1902', uom: 'Pcs', pack: '1 Carton = 48 Pcs', stock: 612, reorder: 200 },
  { id: nextId(), sku: 'SKU-1005', barcode: '8901234560053', name: 'Parle-G Biscuit 200g', category: 'Snacks', cost: 16, wholesale: 18, retail: 20, gst: 18, cess: 0, hsn: '1905', uom: 'Pcs', pack: '1 Carton = 96 Pcs', stock: 38, reorder: 150 },
  { id: nextId(), sku: 'SKU-1006', barcode: '8901234560060', name: 'Surf Excel 1kg', category: 'Home Care', cost: 132, wholesale: 148, retail: 169, gst: 18, cess: 0, hsn: '3402', uom: 'Pkt', pack: '1 Carton = 12 Pkts', stock: 71, reorder: 50 },
  { id: nextId(), sku: 'SKU-1007', barcode: '8901234560077', name: 'Amul Butter 500g', category: 'Dairy', cost: 238, wholesale: 255, retail: 275, gst: 12, cess: 0, hsn: '0405', uom: 'Pkt', pack: '1 Crate = 24 Pkts', stock: 19, reorder: 30 },
  { id: nextId(), sku: 'SKU-1008', barcode: '8901234560084', name: 'Coca-Cola 750ml', category: 'Beverages', cost: 32, wholesale: 36, retail: 42, gst: 28, cess: 12, hsn: '2202', uom: 'Btl', pack: '1 Crate = 24 Btls', stock: 96, reorder: 70 },
  { id: nextId(), sku: 'SKU-1009', barcode: '8901234560091', name: 'Dettol Soap 125g', category: 'Personal Care', cost: 29, wholesale: 33, retail: 38, gst: 18, cess: 0, hsn: '3401', uom: 'Pcs', pack: '1 Carton = 72 Pcs', stock: 210, reorder: 100 },
  { id: nextId(), sku: 'SKU-1010', barcode: '8901234560107', name: 'Red Label Tea 250g', category: 'Grocery', cost: 112, wholesale: 124, retail: 140, gst: 5, cess: 0, hsn: '0902', uom: 'Pkt', pack: '1 Carton = 24 Pkts', stock: 27, reorder: 35 },
];

export const B2B_PARTIES_SEED: B2BParty[] = [
  { id: nextId(), name: 'Sri Lakshmi General Stores', gstin: '36AAACS1234F1Z5', state: 'Telangana', address: 'Begum Bazaar, Hyderabad', phone: '9848012345' },
  { id: nextId(), name: 'New Vasavi Traders', gstin: '37AAACV5678K1Z2', state: 'Andhra Pradesh', address: 'MG Road, Vijayawada', phone: '9848055512' },
  { id: nextId(), name: 'Om Sai Super Mart', gstin: '29AAACO4321L1Z9', state: 'Karnataka', address: 'Jayanagar, Bengaluru', phone: '9900011223' },
];

export const SUPPLIERS_SEED: Supplier[] = [
  { id: nextId(), name: 'Balaji Distributors', gstin: '36AAACB9988D1Z1', phone: '9866112233', billed: 428600, paid: 391200 },
  { id: nextId(), name: 'Krishna Agro Traders', gstin: '36AAACK7744F1Z6', phone: '9866554411', billed: 216400, paid: 216400 },
  { id: nextId(), name: 'Ganesh FMCG Supplies', gstin: '36AAACG3322H1Z8', phone: '9866778899', billed: 158900, paid: 120000 },
];

export interface SeedHistory {
  invoices: B2BInvoice[];
  sales: POSSale[];
  purchases: Purchase[];
  nextInvoiceSeq: number;
  nextBillSeq: number;
  nextPoSeq: number;
}

/** Builds a few days of realistic transaction history so the API isn't empty on first boot. */
export function buildSeedHistory(products: Product[], parties: B2BParty[], suppliers: Supplier[]): SeedHistory {
  let invoiceSeq = 241;
  let billSeq = 5810;
  let poSeq = 118;

  const invoices: B2BInvoice[] = [];
  const seedInvoicePlan: { partyIdx: number; lines: { productIdx: number; qty: number }[]; term: B2BInvoice['term']; daysAgo: number }[] = [
    { partyIdx: 0, lines: [{ productIdx: 0, qty: 40 }, { productIdx: 3, qty: 120 }], term: 'Full Paid', daysAgo: 6 },
    { partyIdx: 1, lines: [{ productIdx: 1, qty: 24 }, { productIdx: 5, qty: 18 }], term: 'Credit (Khata)', daysAgo: 4 },
    { partyIdx: 2, lines: [{ productIdx: 7, qty: 48 }, { productIdx: 8, qty: 60 }], term: 'Partial Advance', daysAgo: 2 },
    { partyIdx: 0, lines: [{ productIdx: 2, qty: 15 }, { productIdx: 9, qty: 20 }], term: 'Full Paid', daysAgo: 1 },
  ];

  seedInvoicePlan.forEach((plan) => {
    const party = parties[plan.partyIdx];
    const items = plan.lines.map(({ productIdx, qty }) => {
      const p = products[productIdx];
      const base = { productId: p.id, name: p.name, hsn: p.hsn, qty, rate: p.wholesale, gst: p.gst, cess: p.cess, discAmt: 0 };
      const g = gstSplit(base, party.state);
      return { ...base, ...g };
    });
    const subtotal = items.reduce((a, i) => a + i.qty * i.rate, 0);
    const cgst = items.reduce((a, i) => a + i.cgst, 0);
    const sgst = items.reduce((a, i) => a + i.sgst, 0);
    const igst = items.reduce((a, i) => a + i.igst, 0);
    const cess = items.reduce((a, i) => a + i.cess, 0);
    const total = subtotal + cgst + sgst + igst + cess;
    const date = new Date();
    date.setDate(date.getDate() - plan.daysAgo);
    invoices.push({
      id: nextId(),
      no: 'GST/25-26/' + invoiceSeq++,
      date: date.toISOString(),
      party,
      items,
      subtotal,
      cgst,
      sgst,
      igst,
      cess,
      total,
      term: plan.term,
      ewayBill: total > 50000 ? 'EWB' + Math.floor(Math.random() * 900000000 + 100000000) : '',
      vehicle: total > 50000 ? 'TS09' + Math.floor(Math.random() * 9000 + 1000) + 'AB' : '',
    });
  });

  const sales: POSSale[] = [];
  const seedPosPlan: { lines: { productIdx: number; qty: number }[]; mode: POSSale['mode']; daysAgo: number }[] = [
    { lines: [{ productIdx: 4, qty: 3 }, { productIdx: 8, qty: 2 }], mode: 'Cash', daysAgo: 0 },
    { lines: [{ productIdx: 6, qty: 1 }, { productIdx: 0, qty: 2 }], mode: 'UPI', daysAgo: 0 },
    { lines: [{ productIdx: 7, qty: 6 }], mode: 'Card', daysAgo: 1 },
    { lines: [{ productIdx: 3, qty: 5 }, { productIdx: 9, qty: 1 }], mode: 'UPI', daysAgo: 1 },
    { lines: [{ productIdx: 1, qty: 1 }, { productIdx: 5, qty: 1 }], mode: 'Cash', daysAgo: 2 },
  ];
  seedPosPlan.forEach((plan) => {
    const items = plan.lines.map(({ productIdx, qty }) => {
      const p = products[productIdx];
      const net = p.retail * qty;
      return { productId: p.id, name: p.name, mrp: p.retail, rate: p.retail, qty, discPct: 0, gst: p.gst, net };
    });
    const subtotal = items.reduce((a, i) => a + i.rate * i.qty, 0);
    const gstAmt = items.reduce((a, i) => a + i.rate * i.qty * (i.gst / (100 + i.gst)), 0);
    const date = new Date();
    date.setDate(date.getDate() - plan.daysAgo);
    date.setHours(10 + Math.floor(Math.random() * 9));
    sales.push({ id: nextId(), no: 'POS-' + billSeq++, date: date.toISOString(), items, subtotal, discount: 0, gst: gstAmt, total: subtotal, mode: plan.mode, customer: '' });
  });

  const purchases: Purchase[] = [
    {
      id: nextId(),
      no: 'PO-' + poSeq++,
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      supplier: suppliers[0],
      items: [
        { productId: products[0].id, name: 'Tata Salt 1kg', qty: 200, rate: 18 },
        { productId: products[3].id, name: 'Maggi Noodles 70g', qty: 600, rate: 11 },
      ],
      total: 200 * 18 + 600 * 11,
      status: 'Received',
    },
    {
      id: nextId(),
      no: 'PO-' + poSeq++,
      date: new Date(Date.now() - 1 * 86400000).toISOString(),
      supplier: suppliers[2],
      items: [{ productId: products[7].id, name: 'Coca-Cola 750ml', qty: 120, rate: 32 }],
      total: 120 * 32,
      status: 'Received',
    },
  ];

  return { invoices, sales, purchases, nextInvoiceSeq: invoiceSeq, nextBillSeq: billSeq, nextPoSeq: poSeq };
}

export function getSeedIdCounter(): number {
  return idCounter;
}
