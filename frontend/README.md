# Vyapaar — Dual Billing & Inventory Management System (React + TypeScript)

A frontend-only demo of a dual B2B wholesale GST invoicing + B2C retail POS
system, built with React 18, TypeScript and Vite. No backend — all data is
mock data held in memory via a typed `useReducer` store.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

To type-check and produce a production build:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  types.ts            Domain types (Product, B2BInvoice, POSSale, etc.)
  utils.ts             Formatting + GST split calculation (gstSplit)
  data/seed.ts          Mock products, buyers, suppliers + generated history
  state/store.tsx        Global app state: typed reducer + Context
  state/ui.tsx            Ephemeral UI state: modal overlay + toast
  components/            Sidebar, Topbar, ModalShell, icons
  views/
    Dashboard.tsx
    inventory/            Product catalog + add/edit form
    b2b/                  New invoice builder, history, buyer directory,
                          printable A4 invoice preview
    pos/                  Checkout, cart, payment, printable thermal receipt
    suppliers/            Supplier ledger, purchase orders
    reports/              Day-book, GSTR-1, GSTR-3B, item profitability
  App.tsx / main.tsx      Composition root
```

## Notes

- All data (products, invoices, sales, suppliers) lives in a single
  `useReducer` store (`src/state/store.tsx`). Refreshing the page resets
  everything back to the seeded demo data — nothing is persisted.
- GST logic (CGST+SGST vs IGST based on buyer state, CESS) lives in
  `src/utils.ts` as `gstSplit()` and is shared by the seed data and the
  live invoice builder so the math stays consistent everywhere.
- Printing (`window.print()`) is wired for both the A4 tax invoice and the
  thermal receipt; the print stylesheet isolates the open modal so only
  the invoice/receipt content is sent to the printer.
- Written in strict TypeScript; `npm run build` runs `tsc -b` first, so a
  broken type will fail the build rather than fail silently at runtime.
