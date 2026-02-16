import express from 'express';
import cors from 'cors';
import { initDb } from '../server/db/index.js';
import claimsRouter from '../server/routes/claims.js';
import patientsRouter from '../server/routes/patients.js';
import analyticsRouter from '../server/routes/analytics.js';
import payerProfilesRouter from '../server/routes/payerProfiles.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api/claims', claimsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/payer-profiles', payerProfilesRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize DB on cold start
let dbReady: Promise<void> | null = null;

function ensureDb() {
  if (!dbReady) {
    dbReady = initDb().then(() => {
      console.log('DB initialized');
    }).catch((err) => {
      console.error('DB init error:', err);
      dbReady = null;
      throw err;
    });
  }
  return dbReady;
}

// Wrap the Express app to ensure DB is ready before handling requests
const handler = async (req: any, res: any) => {
  await ensureDb();
  app(req, res);
};

export default handler;
