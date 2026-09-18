# Vyapaar — Dual Billing & Inventory Management System

A wholesale (B2B GST invoicing) + retail (B2C POS) demo system, split into
two independent projects in this folder:

```
vyapaar-fullstack/
  frontend/     React + TypeScript app (Vite) — has its own mock data,
                runs entirely standalone, includes the login screen
  backend/      Express + TypeScript API — same mock data model, in-memory
                only, exposed over REST
```

**These two are not wired together yet.** The frontend keeps its own
client-side mock data (via a `useReducer` store) and works fully on its
own. The backend is a separate mock REST API with the same data shapes and
business logic (GST split, stock deduction, invoice/receipt numbering), so
it can be connected to the frontend later by replacing the frontend's
local dispatches with `fetch` calls — see "Wiring them together" below.

## Running each one

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Opens on `http://localhost:5173`. Log in with `admin` / `admin123` (shown
on the login screen).

### Backend
```bash
cd backend
npm install
npm run dev
```
Runs on `http://localhost:4000`. Check `http://localhost:4000/api/health`.

Both can run at the same time on their own ports — the backend has CORS
enabled by default, so the frontend's dev server could call it directly
if you wire that up.

## What's mock and what isn't

Nothing here is persisted to a real database. Both projects seed the same
demo data (10 products, 3 B2B buyers, 3 suppliers, a few days of
transaction history) on startup/load and hold it in memory:

- Refreshing the frontend resets its state to the seed data and logs you out.
- Restarting the backend resets its state to the seed data.

## Wiring them together (optional next step)

If you want the frontend to actually call this backend instead of (or in
addition to) its own local state:

1. Add a small API client in the frontend (e.g. `frontend/src/api.ts`)
   wrapping `fetch` calls to `http://localhost:4000/api/...`.
2. Replace the relevant `dispatch({ type: '...' })` calls in
   `frontend/src/state/store.tsx` — e.g. `GENERATE_B2B_INVOICE`,
   `COMPLETE_SALE`, `SUBMIT_PO` — with calls to that API client, then
   dispatch a new action to merge the server's response into state.
2. See `backend/README.md` for the full endpoint list and request/response
   shapes to match against.

This wasn't done automatically so the frontend keeps working standalone
without requiring the backend to be running.
