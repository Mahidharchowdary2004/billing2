import { Router } from 'express';
import { db, submitPurchaseOrder } from '../store';

const router = Router();

router.get('/', (_req, res) => {
  res.json(db.purchases);
});

router.post('/', (req, res) => {
  const { supplierId, items } = req.body ?? {};
  if (!supplierId || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: 'supplierId and items[] are required' });
  }
  const result = submitPurchaseOrder({ supplierId: Number(supplierId), items });
  if ('error' in result) return res.status(400).json(result);
  res.status(201).json(result);
});

export default router;
