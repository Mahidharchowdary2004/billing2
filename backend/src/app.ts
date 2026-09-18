import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import invoicesRouter from './routes/invoices';
import partiesRouter from './routes/parties';
import productsRouter from './routes/products';
import purchasesRouter from './routes/purchases';
import reportsRouter from './routes/reports';
import salesRouter from './routes/sales';
import suppliersRouter from './routes/suppliers';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', mode: 'in-memory mock data', time: new Date().toISOString() });
  });

  app.use('/api/products', productsRouter);
  app.use('/api/parties', partiesRouter);
  app.use('/api/suppliers', suppliersRouter);
  app.use('/api/invoices', invoicesRouter);
  app.use('/api/sales', salesRouter);
  app.use('/api/purchases', purchasesRouter);
  app.use('/api/reports', reportsRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
