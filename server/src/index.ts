import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { generateStampRouter } from './routes/generateStamp.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

app.use('/api', generateStampRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀  Server listening on http://localhost:${PORT}`);
});
