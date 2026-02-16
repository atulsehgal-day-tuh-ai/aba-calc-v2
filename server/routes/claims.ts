import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/index.js';

const router = Router();

// GET /api/claims
router.get('/', (req, res) => {
  const db = getDb();
  const claims = db.prepare('SELECT * FROM claims ORDER BY created_at DESC').all();
  res.json(claims);
});

// GET /api/claims/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  res.json(claim);
});

// POST /api/claims
router.post('/', (req, res) => {
  const db = getDb();
  const id = uuid();
  const {
    patient_name, patient_id, age, diagnosis,
    assessment_data, calc_result, ml_prediction,
    recommended_hours, tier,
  } = req.body;

  db.prepare(`
    INSERT INTO claims (id, patient_id, patient_name, age, diagnosis, status, assessment_data, calc_result, ml_prediction, recommended_hours, tier)
    VALUES (?, ?, ?, ?, ?, 'submitted', ?, ?, ?, ?, ?)
  `).run(id, patient_id, patient_name, age, diagnosis, assessment_data, calc_result, ml_prediction, recommended_hours, tier);

  // Audit log
  db.prepare(`INSERT INTO audit_log (entity_type, entity_id, action, details, user_role) VALUES ('claim', ?, 'created', ?, 'clinic')`)
    .run(id, JSON.stringify({ patient_name, recommended_hours }));

  const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(id);
  res.status(201).json(claim);
});

// PATCH /api/claims/:id/status
router.patch('/:id/status', (req, res) => {
  const db = getDb();
  const { status, notes } = req.body;

  const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(req.params.id) as any;
  if (!claim) return res.status(404).json({ error: 'Claim not found' });

  db.prepare(`
    UPDATE claims SET status = ?, review_notes = ?, reviewed_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ?
  `).run(status, notes || null, req.params.id);

  // If approved, set approved_hours = recommended_hours
  if (status === 'approved') {
    db.prepare('UPDATE claims SET approved_hours = recommended_hours WHERE id = ?').run(req.params.id);
  }

  // Audit log
  db.prepare(`INSERT INTO audit_log (entity_type, entity_id, action, details, user_role) VALUES ('claim', ?, ?, ?, 'insurance')`)
    .run(req.params.id, `status_${status}`, JSON.stringify({ status, notes }));

  const updated = db.prepare('SELECT * FROM claims WHERE id = ?').get(req.params.id);
  res.json(updated);
});

export default router;
