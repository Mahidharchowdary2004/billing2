import { Router } from 'express';
import { addProduct, db, updateProduct } from '../store';

const router = Router();

router.get('/', (_req, res) => {
  res.json(db.products);
});

router.post('/', (req, res) => {
  const { name, sku, barcode, category, hsn, gst, cost, wholesale, retail, cess, uom, pack, stock, reorder } = req.body ?? {};
  if (!name || typeof gst !== 'number') {
    return res.status(400).json({ error: 'name and gst are required' });
  }
  const product = addProduct({
    name,
    sku: sku ?? '',
    barcode: barcode ?? '',
    category: category ?? 'Grocery',
    hsn: hsn ?? '',
    gst,
    cost: Number(cost) || 0,
    wholesale: Number(wholesale) || 0,
    retail: Number(retail) || 0,
    cess: Number(cess) || 0,
    uom: uom ?? 'Pcs',
    pack: pack ?? '',
    stock: Number(stock) || 0,
    reorder: Number(reorder) || 10,
  });
  res.status(201).json(product);
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const updated = updateProduct(id, req.body);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

export default router;
