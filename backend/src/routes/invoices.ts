import { Router } from 'express';
import { db, generateInvoice } from '../store';

const router = Router();

router.get('/', (_req, res) => {
  res.json(db.invoices);
});

router.get('/:id', (req, res) => {
  const invoice = db.invoices.find((i) => i.id === Number(req.params.id));
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json(invoice);
});

router.post('/', (req, res) => {
  const { partyId, items, term, vehicle, rcm, ewayBill } = req.body ?? {};
  if (!partyId || !Array.isArray(items)) {
    return res.status(400).json({ error: 'partyId and items[] are required' });
  }
  const result = generateInvoice({ partyId: Number(partyId), items, term: term ?? 'Full Paid', vehicle, rcm, ewayBill });
  if ('error' in result) return res.status(400).json(result);
  res.status(201).json(result);
});

export default router;
