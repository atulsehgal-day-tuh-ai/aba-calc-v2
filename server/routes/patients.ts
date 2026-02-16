import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/index.js';

const router = Router();

// GET /api/patients
router.get('/', (_req, res) => {
  const db = getDb();
  const patients = db.prepare('SELECT * FROM patients ORDER BY name').all();
  res.json(patients);
});

// GET /api/patients/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

// POST /api/patients
router.post('/', (req, res) => {
  const db = getDb();
  const id = req.body.id || `P-${uuid().slice(0, 6)}`;
  const { name, age, diagnosis, educational_setting, living_situation } = req.body;

  db.prepare(`
    INSERT INTO patients (id, name, age, diagnosis, educational_setting, living_situation)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name, age, diagnosis, educational_setting, living_situation);

  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  res.status(201).json(patient);
});

export default router;
