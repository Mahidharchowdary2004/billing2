export interface Product {
  id: number;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  cost: number;
  wholesale: number;
  retail: number;
  gst: number;
  cess: number;
  hsn: string;
  uom: string;
  pack: string;
  stock: number;
  reorder: number;
}

export interface B2BParty {
  id: number;
  name: string;
  gstin: string;
  state: string;
  address: string;
  phone: string;
}

export interface Supplier {
  id: number;
  name: string;
  gstin: string;
  phone: string;
  billed: number;
  paid: number;
}

export type PaymentTerm = 'Full Paid' | 'Partial Advance' | 'Credit (Khata)';

export interface B2BInvoiceLine {
  productId: number;
  name: string;
  hsn: string;
  qty: number;
  rate: number;
  gst: number;
  cess: number;
  discAmt: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface B2BInvoice {
  id: number;
  no: string;
  date: string; // ISO string over the wire
  party: B2BParty;
  items: B2BInvoiceLine[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  total: number;
  term: PaymentTerm;
  vehicle?: string;
  rcm?: 'Yes' | 'No';
  ewayBill?: string;
}

export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Wallet';

export interface POSLine {
  productId: number;
  name: string;
  mrp: number;
  rate: number;
  qty: number;
  discPct: number;
  gst: number;
  net: number;
}

export interface POSSale {
  id: number;
  no: string;
  date: string;
  items: POSLine[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  mode: PaymentMode;
  customer?: string;
}

export interface PurchaseLine {
  productId: number;
  name: string;
  qty: number;
  rate: number;
}

export interface Purchase {
  id: number;
  no: string;
  date: string;
  supplier: Supplier;
  items: PurchaseLine[];
  total: number;
  status: string;
}
