# Vyapaar Backend — Mock REST API

A small Express + TypeScript API that serves the **same mock data** the
frontend already uses (products, buyers, suppliers, invoices, sales,
purchases), so the business logic — GST splitting, stock deduction,
invoice/receipt numbering — lives in one place and can be called over HTTP.

**This is still mock data, on purpose.** There is no database. Everything
lives in plain arrays in memory (`src/store.ts`), seeded on boot from
`src/data/seed.ts` — the exact same seed used by the frontend. Restarting
the server resets everything. The frontend has **not** been changed and
still works standalone with its own client-side mock data; wiring the two
together (replacing the frontend's local `useReducer` calls with `fetch`
calls to this API) is a separate step if you want it later.

## Run it

```bash
npm install
npm run dev      # starts on http://localhost:4000 with auto-reload
```

Or build + run compiled JS:

```bash
npm run build
npm start
```

Check it's alive:

```bash
curl http://localhost:4000/api/health
```

## Endpoints

All responses are JSON. All monetary values are plain numbers (no currency
formatting — that's a frontend concern).

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Liveness check |
| GET | `/api/products` | List all products |
| POST | `/api/products` | Add a product (`name`, `gst` required) |
| PUT | `/api/products/:id` | Update a product |
| GET | `/api/parties` | List B2B buyers |
| POST | `/api/parties` | Add a buyer (`name` required) |
| GET | `/api/suppliers` | List suppliers with billed/paid ledger |
| GET | `/api/invoices` | List all B2B tax invoices |
| GET | `/api/invoices/:id` | Get one invoice |
| POST | `/api/invoices` | Generate a tax invoice — `{ partyId, items:[{productId,qty,discPct}], term, vehicle?, rcm?, ewayBill? }`. Computes CGST/SGST vs IGST via `gstSplit`, deducts stock. |
| GET | `/api/sales` | List all POS sales |
| GET | `/api/sales/:id` | Get one sale |
| POST | `/api/sales` | Complete a POS sale — `{ items:[{productId,qty,discPct}], mode, customer? }`. Deducts stock. |
| GET | `/api/purchases` | List purchase orders |
| POST | `/api/purchases` | Submit a PO — `{ supplierId, items:[{productId,qty}] }`. Increments stock, updates supplier's billed total. |
| GET | `/api/reports/dashboard` | Today's revenue by channel, low-stock list, outstanding credit, recent activity, payment-terms mix |
| GET | `/api/reports/daybook` | Today's cash/UPI/card/B2B breakdown + transaction log |
| GET | `/api/reports/gstr1` | HSN-wise outward supply summary |
| GET | `/api/reports/gstr3b` | Output tax vs estimated ITC |
| GET | `/api/reports/profitability` | Per-item margin across both channels |

## Project structure

```
src/
  types.ts         Domain types (same shape as the frontend's)
  utils.ts          gstSplit() — the one shared tax-calculation function
  data/seed.ts        Mock products/buyers/suppliers + generated history
  store.ts             In-memory "database" + all mutation logic
  routes/               One router per resource
  app.ts                  Express app: CORS, JSON body parsing, routes, 404/error handlers
  server.ts                 Boots the app on PORT (default 4000)
```

## Notes

- CORS is open by default (`cors()`), so a frontend dev server on a
  different port (e.g. Vite's `5173`) can call this API directly during
  development.
- `PORT` env var overrides the default `4000`.
- Written in strict TypeScript; `npm run build` runs `tsc` and will fail
  the build on a type error rather than fail silently at runtime.
