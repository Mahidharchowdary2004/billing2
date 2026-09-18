import { Router } from 'express';
import { completeSale, db } from '../store';

const router = Router();

router.get('/', (_req, res) => {
  res.json(db.sales);
});

router.get('/:id', (req, res) => {
  const sale = db.sales.find((s) => s.id === Number(req.params.id));
  if (!sale) return res.status(404).json({ error: 'Sale not found' });
  res.json(sale);
});

router.post('/', (req, res) => {
  const { items, mode, customer } = req.body ?? {};
  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: 'items[] is required' });
  }
  const result = completeSale({ items, mode: mode ?? 'Cash', customer });
  if ('error' in result) return res.status(400).json(result);
  res.status(201).json(result);
});

export default router;
