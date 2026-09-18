import { B2B_PARTIES_SEED, PRODUCTS_SEED, SUPPLIERS_SEED, buildSeedHistory, getSeedIdCounter } from './data/seed';
import { B2BInvoice, B2BParty, PaymentMode, PaymentTerm, POSSale, Product, Purchase, Supplier } from './types';
import { gstSplit } from './utils';

const history = buildSeedHistory(PRODUCTS_SEED, B2B_PARTIES_SEED, SUPPLIERS_SEED);

/**
 * Everything below is held in plain in-memory arrays — there is no database.
 * This mirrors the mock data already used by the frontend so both sides show
 * the same demo state. Restarting the server resets everything back to the
 * seed below.
 */
export const db = {
  products: [...PRODUCTS_SEED] as Product[],
  parties: [...B2B_PARTIES_SEED] as B2BParty[],
  suppliers: [...SUPPLIERS_SEED] as Supplier[],
  invoices: [...history.invoices] as B2BInvoice[],
  sales: [...history.sales] as POSSale[],
  purchases: [...history.purchases] as Purchase[],
  seq: {
    id: getSeedIdCounter(),
    invoice: history.nextInvoiceSeq,
    bill: history.nextBillSeq,
    po: history.nextPoSeq,
  },
};

const nextId = () => ++db.seq.id;

/* ---------- Products ---------- */

export function addProduct(input: Omit<Product, 'id'>): Product {
  const product: Product = { id: nextId(), ...input };
  db.products.push(product);
  return product;
}

export function updateProduct(id: number, changes: Omit<Product, 'id'>): Product | null {
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.products[idx] = { id, ...changes };
  return db.products[idx];
}

/* ---------- Buyers (B2B parties) ---------- */

export function addParty(input: Omit<B2BParty, 'id'>): B2BParty {
  const party: B2BParty = { id: nextId(), ...input };
  db.parties.push(party);
  return party;
}

/* ---------- B2B invoices ---------- */

export interface GenerateInvoiceInput {
  partyId: number;
  items: { productId: number; qty: number; discPct: number }[];
  term: PaymentTerm;
  vehicle?: string;
  rcm?: 'Yes' | 'No';
  ewayBill?: string;
}

export function generateInvoice(input: GenerateInvoiceInput): B2BInvoice | { error: string } {
  const party = db.parties.find((p) => p.id === input.partyId);
  if (!party) return { error: 'Buyer not found' };
  if (!input.items.length) return { error: 'At least one line item is required' };

  const items = [];
  for (const it of input.items) {
    const p = db.products.find((pp) => pp.id === it.productId);
    if (!p) return { error: `Product ${it.productId} not found` };
    const base = {
      productId: p.id,
      name: p.name,
      hsn: p.hsn,
      qty: it.qty,
      rate: p.wholesale,
      gst: p.gst,
      cess: p.cess,
      discAmt: p.wholesale * it.qty * ((it.discPct || 0) / 100),
    };
    const g = gstSplit(base, party.state);
    items.push({ ...base, ...g });
  }

  const subtotal = items.reduce((a, l) => a + l.qty * l.rate - l.discAmt, 0);
  const cgst = items.reduce((a, l) => a + l.cgst, 0);
  const sgst = items.reduce((a, l) => a + l.sgst, 0);
  const igst = items.reduce((a, l) => a + l.igst, 0);
  const cess = items.reduce((a, l) => a + l.cess, 0);
  const total = subtotal + cgst + sgst + igst + cess;

  // Deduct stock now that the invoice is confirmed.
  items.forEach((l) => {
    const p = db.products.find((pp) => pp.id === l.productId);
    if (p) p.stock = Math.max(0, p.stock - l.qty);
  });

  const invoice: B2BInvoice = {
    id: nextId(),
    no: 'GST/25-26/' + db.seq.invoice++,
    date: new Date().toISOString(),
    party,
    items,
    subtotal,
    cgst,
    sgst,
    igst,
    cess,
    total,
    term: input.term,
    vehicle: input.vehicle,
    rcm: input.rcm,
    ewayBill: input.ewayBill,
  };
  db.invoices.unshift(invoice);
  return invoice;
}

/* ---------- POS sales ---------- */

export interface CompleteSaleInput {
  items: { productId: number; qty: number; discPct: number }[];
  mode: PaymentMode;
  customer?: string;
}

export function completeSale(input: CompleteSaleInput): POSSale | { error: string } {
  if (!input.items.length) return { error: 'Cart is empty' };

  const items = [];
  for (const c of input.items) {
    const p = db.products.find((pp) => pp.id === c.productId);
    if (!p) return { error: `Product ${c.productId} not found` };
    const gross = p.retail * c.qty;
    const disc = gross * ((c.discPct || 0) / 100);
    items.push({ productId: p.id, name: p.name, mrp: p.retail, rate: p.retail, qty: c.qty, discPct: c.discPct || 0, gst: p.gst, net: gross - disc });
  }

  items.forEach((l) => {
    const p = db.products.find((pp) => pp.id === l.productId);
    if (p) p.stock = Math.max(0, p.stock - l.qty);
  });

  const subtotal = items.reduce((a, l) => a + l.mrp * l.qty, 0);
  const discount = items.reduce((a, l) => a + l.mrp * l.qty * (l.discPct / 100), 0);
  const gstAmt = items.reduce((a, l) => a + l.net * (l.gst / (100 + l.gst)), 0);

  const sale: POSSale = {
    id: nextId(),
    no: 'POS-' + db.seq.bill++,
    date: new Date().toISOString(),
    items,
    subtotal,
    discount,
    gst: gstAmt,
    total: subtotal - discount,
    mode: input.mode,
    customer: input.customer,
  };
  db.sales.unshift(sale);
  return sale;
}

/* ---------- Purchases ---------- */

export interface SubmitPOInput {
  supplierId: number;
  items: { productId: number; qty: number }[];
}

export function submitPurchaseOrder(input: SubmitPOInput): Purchase | { error: string } {
  const supplier = db.suppliers.find((s) => s.id === input.supplierId);
  if (!supplier) return { error: 'Supplier not found' };
  if (!input.items.length) return { error: 'At least one line item is required' };

  const lineDetails = [];
  for (const it of input.items) {
    const p = db.products.find((pp) => pp.id === it.productId);
    if (!p) return { error: `Product ${it.productId} not found` };
    lineDetails.push({ productId: p.id, name: p.name, qty: it.qty, rate: p.cost });
  }
  const total = lineDetails.reduce((a, l) => a + l.qty * l.rate, 0);

  lineDetails.forEach((l) => {
    const p = db.products.find((pp) => pp.id === l.productId);
    if (p) p.stock += l.qty;
  });
  supplier.billed += total;

  const purchase: Purchase = {
    id: nextId(),
    no: 'PO-' + db.seq.po++,
    date: new Date().toISOString(),
    supplier,
    items: lineDetails,
    total,
    status: 'Received',
  };
  db.purchases.unshift(purchase);
  return purchase;
}
