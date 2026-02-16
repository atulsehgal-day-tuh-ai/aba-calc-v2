import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/index.js';

const router = Router();

// GET /api/patients
router.get('/', async (_req, res) => {
  const db = getDb();
  const result = await db.execute('SELECT * FROM patients ORDER BY name');
  res.json(result.rows);
});

// GET /api/patients/:id
router.get('/:id', async (req, res) => {
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM patients WHERE id = ?', args: [req.params.id] });
  if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
  res.json(result.rows[0]);
});

// POST /api/patients
router.post('/', async (req, res) => {
  const db = getDb();
  const id = req.body.id || `P-${uuid().slice(0, 6)}`;
  const { name, age, diagnosis, educational_setting, living_situation } = req.body;

  await db.execute({
    sql: 'INSERT INTO patients (id, name, age, diagnosis, educational_setting, living_situation) VALUES (?, ?, ?, ?, ?, ?)',
    args: [id, name, age, diagnosis, educational_setting, living_situation],
  });

  const result = await db.execute({ sql: 'SELECT * FROM patients WHERE id = ?', args: [id] });
  res.status(201).json(result.rows[0]);
});

export default router;
