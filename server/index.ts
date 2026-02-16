import express from 'express';
import cors from 'cors';
import claimsRouter from './routes/claims.js';
import patientsRouter from './routes/patients.js';
import analyticsRouter from './routes/analytics.js';
import payerProfilesRouter from './routes/payerProfiles.js';

const app = express();
const PORT = process.env.PORT || 3001;

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

app.listen(PORT, () => {
  console.log(`🚀 ABA Calculator API running on http://localhost:${PORT}`);
});
