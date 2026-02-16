export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date_of_birth TEXT,
    age INTEGER,
    diagnosis TEXT,
    diagnosis_code TEXT DEFAULT 'F84.0',
    educational_setting TEXT,
    living_situation TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS claims (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    patient_name TEXT,
    age INTEGER,
    diagnosis TEXT,
    status TEXT DEFAULT 'submitted',
    assessment_data TEXT,
    calc_result TEXT,
    ml_prediction TEXT,
    recommended_hours REAL,
    approved_hours REAL,
    tier INTEGER,
    reviewer_id TEXT,
    review_notes TEXT,
    submitted_at TEXT DEFAULT (datetime('now')),
    reviewed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS payer_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    max_hours REAL DEFAULT 40,
    min_hours REAL DEFAULT 10,
    fii_w REAL DEFAULT 1.0,
    vin_w REAL DEFAULT 1.0,
    vb_w REAL DEFAULT 1.0,
    beh_w REAL DEFAULT 1.0,
    env_w REAL DEFAULT 1.0,
    age_mult_young REAL DEFAULT 1.2,
    age_mult_mid REAL DEFAULT 1.0,
    age_mult_teen REAL DEFAULT 0.85,
    sup_pct REAL DEFAULT 0.15,
    pt_range_min REAL DEFAULT 2,
    pt_range_max REAL DEFAULT 8,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT,
    entity_id TEXT,
    action TEXT,
    details TEXT,
    user_role TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`;
