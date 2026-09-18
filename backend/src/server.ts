import { createApp } from './app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Vyapaar mock API listening on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/api/health`);
});
