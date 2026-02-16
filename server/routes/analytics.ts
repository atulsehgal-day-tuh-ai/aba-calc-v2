import { Router } from 'express';
import { getDb } from '../db/index.js';

const router = Router();

// GET /api/analytics
router.get('/', async (_req, res) => {
  const db = getDb();

  const totalResult = await db.execute('SELECT COUNT(*) as c FROM claims');
  const total = totalResult.rows[0]?.c as number;

  const approvedResult = await db.execute("SELECT COUNT(*) as c FROM claims WHERE status = 'approved'");
  const approved = approvedResult.rows[0]?.c as number;

  const deniedResult = await db.execute("SELECT COUNT(*) as c FROM claims WHERE status = 'denied'");
  const denied = deniedResult.rows[0]?.c as number;

  const pendingResult = await db.execute("SELECT COUNT(*) as c FROM claims WHERE status NOT IN ('approved', 'denied')");
  const pending = pendingResult.rows[0]?.c as number;

  const avgResult = await db.execute('SELECT AVG(recommended_hours) as avgH, AVG(age) as avgA FROM claims');
  const avgHours = (avgResult.rows[0]?.avgH as number) || 0;
  const avgAge = (avgResult.rows[0]?.avgA as number) || 0;

  const tierResult = await db.execute('SELECT tier, COUNT(*) as c FROM claims GROUP BY tier ORDER BY c DESC LIMIT 1');
  const commonTier = tierResult.rows[0]?.tier ?? null;

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
