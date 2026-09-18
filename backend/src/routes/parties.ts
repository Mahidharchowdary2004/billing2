import { Router } from 'express';
import { addParty, db } from '../store';

const router = Router();

router.get('/', (_req, res) => {
  res.json(db.parties);
});

router.post('/', (req, res) => {
  const { name, gstin, state, address, phone } = req.body ?? {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const party = addParty({ name, gstin: gstin ?? '—', state: state ?? 'Telangana', address: address ?? '', phone: phone ?? '' });
  res.status(201).json(party);
});

export default router;
