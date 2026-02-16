import { Router } from 'express';
import { getDb } from '../db/index.js';

const router = Router();

// GET /api/payer-profiles
router.get('/', (_req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM payer_profiles ORDER BY name').all() as any[];

  // Transform DB rows to PayerProfile shape
  const profiles = rows.map((r) => ({
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
router.get('/:id', (req, res) => {
  const db = getDb();
  const r = db.prepare('SELECT * FROM payer_profiles WHERE id = ?').get(req.params.id) as any;
  if (!r) return res.status(404).json({ error: 'Profile not found' });

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
router.put('/:id', (req, res) => {
  const db = getDb();
  const data = req.body;

  db.prepare(`
    UPDATE payer_profiles SET
      name = ?, max_hours = ?, min_hours = ?,
      fii_w = ?, vin_w = ?, vb_w = ?, beh_w = ?, env_w = ?,
      age_mult_young = ?, age_mult_mid = ?, age_mult_teen = ?,
      sup_pct = ?, pt_range_min = ?, pt_range_max = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    data.name, data.maxHours, data.minHours,
    data.fiiW, data.vinW, data.vbW, data.behW, data.envW,
    data.ageMult?.young, data.ageMult?.mid, data.ageMult?.teen,
    data.supPct, data.ptRange?.[0], data.ptRange?.[1],
    req.params.id
  );

  res.json({ success: true });
});

export default router;
