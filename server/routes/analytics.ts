import { Router } from 'express';
import { getDb } from '../db/index.js';

const router = Router();

// GET /api/analytics
router.get('/', (_req, res) => {
  const db = getDb();

  const total = (db.prepare('SELECT COUNT(*) as c FROM claims').get() as any).c;
  const approved = (db.prepare("SELECT COUNT(*) as c FROM claims WHERE status = 'approved'").get() as any).c;
  const denied = (db.prepare("SELECT COUNT(*) as c FROM claims WHERE status = 'denied'").get() as any).c;
  const pending = (db.prepare("SELECT COUNT(*) as c FROM claims WHERE status NOT IN ('approved', 'denied')").get() as any).c;

  const avgRow = db.prepare('SELECT AVG(recommended_hours) as avgH, AVG(age) as avgA FROM claims').get() as any;
  const avgHours = avgRow?.avgH || 0;
  const avgAge = avgRow?.avgA || 0;

  // Most common tier
  const tierRow = db.prepare('SELECT tier, COUNT(*) as c FROM claims GROUP BY tier ORDER BY c DESC LIMIT 1').get() as any;
  const commonTier = tierRow?.tier || null;

  res.json({
    total,
    approved,
    denied,
    pending,
    avgHours,
    avgAge,
    commonTier,
  });
});

export default router;
