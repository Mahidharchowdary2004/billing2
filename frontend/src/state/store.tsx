import React, { createContext, Dispatch, ReactNode, useContext, useMemo, useReducer } from 'react';
import { B2B_PARTIES_SEED, PRODUCTS_SEED, SUPPLIERS_SEED, buildSeedHistory, getSeedIdCounter } from '../data/seed';
import {
  B2BDraft,
  B2BInvoice,
  B2BParty,
  CartLine,
  PaymentMode,
  PaymentTerm,
  POSSale,
  Product,
  Purchase,
  Settings,
  Supplier,
  ViewName,
} from '../types';
import { gstSplit } from '../utils';

export interface AppState {
  products: Product[];
  parties: B2BParty[];
  suppliers: Supplier[];
  invoices: B2BInvoice[];
  sales: POSSale[];
  purchases: Purchase[];
  cart: CartLine[];
  b2bDraft: B2BDraft;
  view: ViewName;
  seq: { id: number; invoice: number; bill: number; po: number };
  settings: Settings;
  lastInvoiceId: number | null;
  lastSaleId: number | null;
}

function buildInitialState(): AppState {
  const products = PRODUCTS_SEED;
  const parties = B2B_PARTIES_SEED;
  const suppliers = SUPPLIERS_SEED;
  const history = buildSeedHistory(products, parties, suppliers);
  
  let settings: Settings = { b2bPrintFormat: 'A4', b2cPrintFormat: 'Thermal' };
  try {
    const saved = localStorage.getItem('vyapaar_settings');
    if (saved) settings = { ...settings, ...JSON.parse(saved) };
  } catch (e) {
    // ignore
  }

  return {
    products,
    parties,
    suppliers,
    invoices: history.invoices,
    sales: history.sales,
    purchases: history.purchases,
    cart: [],
    b2bDraft: { party: null, items: [] },
    view: 'dashboard',
    seq: { id: getSeedIdCounter(), invoice: history.nextInvoiceSeq, bill: history.nextBillSeq, po: history.nextPoSeq },
    settings,
    lastInvoiceId: null,
    lastSaleId: null,
  };
}

type Action =
  | { type: 'SET_VIEW'; view: ViewName }
  | { type: 'ADD_PRODUCT'; product: Omit<Product, 'id'> }
  | { type: 'UPDATE_PRODUCT'; id: number; changes: Omit<Product, 'id'> }
  | { type: 'ADD_PARTY'; party: Omit<B2BParty, 'id'> }
  | { type: 'SET_B2B_PARTY'; partyId: number | null }
  | { type: 'ADD_B2B_LINE'; productId: number }
  | { type: 'UPDATE_B2B_LINE'; index: number; field: 'qty' | 'discPct'; value: number }
  | { type: 'REMOVE_B2B_LINE'; index: number }
  | { type: 'RESET_B2B_DRAFT' }
  | { type: 'GENERATE_B2B_INVOICE'; term: PaymentTerm; vehicle: string; rcm: 'Yes' | 'No'; ewayBill: string }
  | { type: 'ADD_TO_CART'; productId: number }
  | { type: 'CHANGE_CART_QTY'; index: number; delta: number }
  | { type: 'SET_CART_DISC'; index: number; value: number }
  | { type: 'REMOVE_FROM_CART'; index: number }
  | { type: 'COMPLETE_SALE'; mode: PaymentMode; customer: string }
  | { type: 'SUBMIT_PO'; supplierId: number; items: { productId: number; qty: number }[] }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<Settings> }
  | { type: 'CLEAR_LAST_MARKERS' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.view };

    case 'ADD_PRODUCT': {
      const id = state.seq.id + 1;
      const product: Product = { id, ...action.product };
      return { ...state, products: [...state.products, product], seq: { ...state.seq, id } };
    }

    case 'UPDATE_PRODUCT': {
      const products = state.products.map((p) => (p.id === action.id ? { id: action.id, ...action.changes } : p));
      return { ...state, products };
    }

    case 'ADD_PARTY': {
      const id = state.seq.id + 1;
      const party: B2BParty = { id, ...action.party };
      return {
        ...state,
        parties: [...state.parties, party],
        b2bDraft: { ...state.b2bDraft, party },
        seq: { ...state.seq, id },
      };
    }

    case 'SET_B2B_PARTY': {
      const party = action.partyId ? state.parties.find((p) => p.id === action.partyId) ?? null : null;
      return { ...state, b2bDraft: { ...state.b2bDraft, party } };
    }

    case 'ADD_B2B_LINE': {
      const items = [...state.b2bDraft.items];
      const existing = items.find((i) => i.productId === action.productId);
      if (existing) existing.qty += 1;
      else items.push({ productId: action.productId, qty: 1, discPct: 0 });
      return { ...state, b2bDraft: { ...state.b2bDraft, items } };
    }

    case 'UPDATE_B2B_LINE': {
      const items = state.b2bDraft.items.map((line, i) => (i === action.index ? { ...line, [action.field]: action.value } : line));
      return { ...state, b2bDraft: { ...state.b2bDraft, items } };
    }

    case 'REMOVE_B2B_LINE': {
      const items = state.b2bDraft.items.filter((_, i) => i !== action.index);
      return { ...state, b2bDraft: { ...state.b2bDraft, items } };
    }

    case 'RESET_B2B_DRAFT':
      return { ...state, b2bDraft: { party: null, items: [] } };

    case 'GENERATE_B2B_INVOICE': {
      const { party, items: draftItems } = state.b2bDraft;
      if (!party || draftItems.length === 0) return state;

      const products = [...state.products];
      const items = draftItems.map((it) => {
        const p = products.find((pp) => pp.id === it.productId)!;
        const base = {
          productId: p.id,
          name: p.name,
          hsn: p.hsn,
          qty: it.qty,
          rate: p.wholesale,
          gst: p.gst,
          cess: p.cess,
          discAmt: p.wholesale * it.qty * (it.discPct / 100),
        };
        const g = gstSplit(base, party.state);
        return { ...base, ...g };
      });

      const subtotal = items.reduce((a, l) => a + l.qty * l.rate - l.discAmt, 0);
      const cgst = items.reduce((a, l) => a + l.cgst, 0);
      const sgst = items.reduce((a, l) => a + l.sgst, 0);
      const igst = items.reduce((a, l) => a + l.igst, 0);
      const cess = items.reduce((a, l) => a + l.cess, 0);
      const total = subtotal + cgst + sgst + igst + cess;

      const updatedProducts = products.map((p) => {
        const line = items.find((l) => l.productId === p.id);
        return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
      });

      const id = state.seq.id + 1;
      const invoiceNo = 'GST/25-26/' + state.seq.invoice;
      const invoice: B2BInvoice = {
        id,
        no: invoiceNo,
        date: new Date(),
        party,
        items,
        subtotal,
        cgst,
        sgst,
        igst,
        cess,
        total,
        term: action.term,
        vehicle: action.vehicle,
        rcm: action.rcm,
        ewayBill: action.ewayBill,
      };

      return {
        ...state,
        products: updatedProducts,
        invoices: [invoice, ...state.invoices],
        b2bDraft: { party: null, items: [] },
        seq: { ...state.seq, id, invoice: state.seq.invoice + 1 },
        lastInvoiceId: id,
      };
    }

    case 'ADD_TO_CART': {
      const cart = [...state.cart];
      const existing = cart.find((c) => c.productId === action.productId);
      if (existing) existing.qty += 1;
      else cart.push({ productId: action.productId, qty: 1, discPct: 0 });
      return { ...state, cart };
    }

    case 'CHANGE_CART_QTY': {
      const cart = state.cart.map((c, i) => (i === action.index ? { ...c, qty: Math.max(1, c.qty + action.delta) } : c));
      return { ...state, cart };
    }

    case 'SET_CART_DISC': {
      const cart = state.cart.map((c, i) => (i === action.index ? { ...c, discPct: Math.max(0, Math.min(100, action.value)) } : c));
      return { ...state, cart };
    }

    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((_, i) => i !== action.index) };

    case 'COMPLETE_SALE': {
      if (state.cart.length === 0) return state;
      const products = [...state.products];
      const items = state.cart.map((c) => {
        const p = products.find((pp) => pp.id === c.productId)!;
        const gross = p.retail * c.qty;
        const disc = gross * (c.discPct / 100);
        return { productId: p.id, name: p.name, mrp: p.retail, rate: p.retail, qty: c.qty, discPct: c.discPct, gst: p.gst, net: gross - disc };
      });
      const updatedProducts = products.map((p) => {
        const line = items.find((l) => l.productId === p.id);
        return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
      });
      const subtotal = items.reduce((a, l) => a + l.mrp * l.qty, 0);
      const discount = items.reduce((a, l) => a + l.mrp * l.qty * (l.discPct / 100), 0);
      const gstAmt = items.reduce((a, l) => a + l.net * (l.gst / (100 + l.gst)), 0);

      const id = state.seq.id + 1;
      const saleNo = 'POS-' + state.seq.bill;
      const sale: POSSale = {
        id,
        no: saleNo,
        date: new Date(),
        items,
        subtotal,
        discount,
        gst: gstAmt,
        total: subtotal - discount,
        mode: action.mode,
        customer: action.customer,
      };

      return {
        ...state,
        products: updatedProducts,
        sales: [sale, ...state.sales],
        cart: [],
        seq: { ...state.seq, id, bill: state.seq.bill + 1 },
        lastSaleId: id,
      };
    }

    case 'SUBMIT_PO': {
      const supplier = state.suppliers.find((s) => s.id === action.supplierId);
      if (!supplier || action.items.length === 0) return state;
      const lineDetails = action.items.map((it) => {
        const p = state.products.find((pp) => pp.id === it.productId)!;
        return { productId: p.id, name: p.name, qty: it.qty, rate: p.cost };
      });
      const total = lineDetails.reduce((a, l) => a + l.qty * l.rate, 0);
      const updatedProducts = state.products.map((p) => {
        const line = lineDetails.find((l) => l.productId === p.id);
        return line ? { ...p, stock: p.stock + line.qty } : p;
      });
      const updatedSuppliers = state.suppliers.map((s) => (s.id === supplier.id ? { ...s, billed: s.billed + total } : s));
      const id = state.seq.id + 1;
      const purchase: Purchase = {
        id,
        no: 'PO-' + state.seq.po,
        date: new Date(),
        supplier,
        items: lineDetails,
        total,
        status: 'Received',
      };
      return {
        ...state,
        products: updatedProducts,
        suppliers: updatedSuppliers,
        purchases: [purchase, ...state.purchases],
        seq: { ...state.seq, id, po: state.seq.po + 1 },
      };
    }

    case 'UPDATE_SETTINGS': {
      const newSettings = { ...state.settings, ...action.settings };
      try {
        localStorage.setItem('vyapaar_settings', JSON.stringify(newSettings));
      } catch (e) {
        // ignore
      }
      return { ...state, settings: newSettings };
    }

    case 'CLEAR_LAST_MARKERS':
      return { ...state, lastInvoiceId: null, lastSaleId: null };

    default:
      return state;
  }
}

const StateContext = createContext<AppState | null>(null);
const DispatchContext = createContext<Dispatch<Action> | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);
  const stateValue = useMemo(() => state, [state]);
  return (
    <StateContext.Provider value={stateValue}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error('useAppState must be used within StoreProvider');
  return ctx;
}

export function useAppDispatch(): Dispatch<Action> {
  const ctx = useContext(DispatchContext);
  if (!ctx) throw new Error('useAppDispatch must be used within StoreProvider');
  return ctx;
}

export type { Action as AppAction };
