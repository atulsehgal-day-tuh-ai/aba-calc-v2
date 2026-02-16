import { Router } from 'express';
import { getDb } from '../db/index.js';

const router = Router();

// GET /api/payer-profiles
router.get('/', async (_req, res) => {
  const db = getDb();
  const result = await db.execute('SELECT * FROM payer_profiles ORDER BY name');

  // Transform DB rows to PayerProfile shape
  const profiles = result.rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    maxHours: r.max_hours,
    minHours: r.min_hours,
    fiiW: r.fii_w,
    vinW: r.vin_w,
    vbW: r.vb_w,
    behW: r.beh_w,
    envW: r.env_w,
    ageMult: { young: r.age_mult_young, mid: r.age_mult_mid, teen: r.age_mult_teen },
    supPct: r.sup_pct,
    ptRange: [r.pt_range_min, r.pt_range_max],
  }));

  res.json(profiles);
});

// GET /api/payer-profiles/:id
router.get('/:id', async (req, res) => {
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM payer_profiles WHERE id = ?', args: [req.params.id] });
  if (result.rows.length === 0) return res.status(404).json({ error: 'Profile not found' });

  const r: any = result.rows[0];
  res.json({
    id: r.id,
    name: r.name,
    maxHours: r.max_hours,
    minHours: r.min_hours,
    fiiW: r.fii_w,
    vinW: r.vin_w,
    vbW: r.vb_w,
    behW: r.beh_w,
    envW: r.env_w,
    ageMult: { young: r.age_mult_young, mid: r.age_mult_mid, teen: r.age_mult_teen },
    supPct: r.sup_pct,
    ptRange: [r.pt_range_min, r.pt_range_max],
  });
});

// PUT /api/payer-profiles/:id
router.put('/:id', async (req, res) => {
  const db = getDb();
  const data = req.body;

  await db.execute({
    sql: `UPDATE payer_profiles SET
      name = ?, max_hours = ?, min_hours = ?,
      fii_w = ?, vin_w = ?, vb_w = ?, beh_w = ?, env_w = ?,
      age_mult_young = ?, age_mult_mid = ?, age_mult_teen = ?,
      sup_pct = ?, pt_range_min = ?, pt_range_max = ?,
      updated_at = datetime('now')
    WHERE id = ?`,
    args: [
      data.name, data.maxHours, data.minHours,
      data.fiiW, data.vinW, data.vbW, data.behW, data.envW,
      data.ageMult?.young, data.ageMult?.mid, data.ageMult?.teen,
      data.supPct, data.ptRange?.[0], data.ptRange?.[1],
      req.params.id,
    ],
  });

  res.json({ success: true });
});

export default router;
