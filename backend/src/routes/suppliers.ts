import { Router } from 'express';
import { db } from '../store';

const router = Router();

router.get('/', (_req, res) => {
  res.json(db.suppliers);
});

export default router;
