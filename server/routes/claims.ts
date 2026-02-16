import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/index.js';

const router = Router();

// GET /api/claims
router.get('/', async (req, res) => {
  const db = getDb();
  const result = await db.execute('SELECT * FROM claims ORDER BY created_at DESC');
  res.json(result.rows);
});

// GET /api/claims/:id
router.get('/:id', async (req, res) => {
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM claims WHERE id = ?', args: [req.params.id] });
  if (result.rows.length === 0) return res.status(404).json({ error: 'Claim not found' });
  res.json(result.rows[0]);
});

// POST /api/claims
router.post('/', async (req, res) => {
  const db = getDb();
  const id = uuid();
  const {
    patient_name, patient_id, age, diagnosis,
    assessment_data, calc_result, ml_prediction,
    recommended_hours, tier,
  } = req.body;

  await db.execute({
    sql: `INSERT INTO claims (id, patient_id, patient_name, age, diagnosis, status, assessment_data, calc_result, ml_prediction, recommended_hours, tier)
      VALUES (?, ?, ?, ?, ?, 'submitted', ?, ?, ?, ?, ?)`,
    args: [id, patient_id, patient_name, age, diagnosis, assessment_data, calc_result, ml_prediction, recommended_hours, tier],
  });

  // Audit log
  await db.execute({
    sql: `INSERT INTO audit_log (entity_type, entity_id, action, details, user_role) VALUES ('claim', ?, 'created', ?, 'clinic')`,
    args: [id, JSON.stringify({ patient_name, recommended_hours })],
  });

  const claim = await db.execute({ sql: 'SELECT * FROM claims WHERE id = ?', args: [id] });
  res.status(201).json(claim.rows[0]);
});

// PATCH /api/claims/:id/status
router.patch('/:id/status', async (req, res) => {
  const db = getDb();
  const { status, notes } = req.body;

  const existing = await db.execute({ sql: 'SELECT * FROM claims WHERE id = ?', args: [req.params.id] });
  if (existing.rows.length === 0) return res.status(404).json({ error: 'Claim not found' });

  await db.execute({
    sql: `UPDATE claims SET status = ?, review_notes = ?, reviewed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
    args: [status, notes || null, req.params.id],
  });

  // If approved, set approved_hours = recommended_hours
  if (status === 'approved') {
    await db.execute({
      sql: 'UPDATE claims SET approved_hours = recommended_hours WHERE id = ?',
      args: [req.params.id],
    });
  }

  // Audit log
  await db.execute({
    sql: `INSERT INTO audit_log (entity_type, entity_id, action, details, user_role) VALUES ('claim', ?, ?, ?, 'insurance')`,
    args: [req.params.id, `status_${status}`, JSON.stringify({ status, notes })],
  });

  const updated = await db.execute({ sql: 'SELECT * FROM claims WHERE id = ?', args: [req.params.id] });
  res.json(updated.rows[0]);
});

export default router;
