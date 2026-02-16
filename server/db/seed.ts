import { v4 as uuid } from 'uuid';

export function seedDatabase(db: any) {
  // Check if already seeded
  const count = db.prepare('SELECT COUNT(*) as c FROM patients').get() as any;
  if (count.c > 0) return;

  console.log('🌱 Seeding demo data…');

  // --- Patients ---
  const patients = [
    { id: 'P-001', name: 'Alex Johnson', age: 4, diagnosis: 'autism', educational_setting: 'home', living_situation: 'two-parent' },
    { id: 'P-002', name: 'Maya Patel', age: 7, diagnosis: 'autism', educational_setting: 'supported', living_situation: 'single-parent' },
    { id: 'P-003', name: 'Ethan Williams', age: 12, diagnosis: 'autism', educational_setting: 'special-ed', living_situation: 'two-parent' },
    { id: 'P-004', name: 'Sofia Rodriguez', age: 3, diagnosis: 'pdd', educational_setting: 'not-enrolled', living_situation: 'two-parent' },
    { id: 'P-005', name: 'Liam Chen', age: 15, diagnosis: 'aspergers', educational_setting: 'mainstream', living_situation: 'single-parent' },
  ];

  const insertPatient = db.prepare(`
    INSERT INTO patients (id, name, age, diagnosis, educational_setting, living_situation) VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const p of patients) {
    insertPatient.run(p.id, p.name, p.age, p.diagnosis, p.educational_setting, p.living_situation);
  }

  // --- Payer Profiles ---
  const profiles = [
    { id: 'PP-001', name: 'Default', max_hours: 40, min_hours: 10, fii_w: 1, vin_w: 1, vb_w: 1, beh_w: 1, env_w: 1, age_mult_young: 1.2, age_mult_mid: 1.0, age_mult_teen: 0.85, sup_pct: 0.15, pt_range_min: 2, pt_range_max: 8 },
    { id: 'PP-002', name: 'Conservative', max_hours: 30, min_hours: 10, fii_w: 1, vin_w: 0.8, vb_w: 0.8, beh_w: 0.9, env_w: 0.7, age_mult_young: 1.1, age_mult_mid: 1.0, age_mult_teen: 0.8, sup_pct: 0.12, pt_range_min: 2, pt_range_max: 6 },
    { id: 'PP-003', name: 'Progressive', max_hours: 40, min_hours: 15, fii_w: 1.1, vin_w: 1.1, vb_w: 1.1, beh_w: 1.2, env_w: 1.1, age_mult_young: 1.25, age_mult_mid: 1.0, age_mult_teen: 0.9, sup_pct: 0.18, pt_range_min: 3, pt_range_max: 10 },
  ];

  const insertProfile = db.prepare(`
    INSERT INTO payer_profiles (id, name, max_hours, min_hours, fii_w, vin_w, vb_w, beh_w, env_w,
      age_mult_young, age_mult_mid, age_mult_teen, sup_pct, pt_range_min, pt_range_max) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of profiles) {
    insertProfile.run(p.id, p.name, p.max_hours, p.min_hours, p.fii_w, p.vin_w, p.vb_w, p.beh_w, p.env_w,
      p.age_mult_young, p.age_mult_mid, p.age_mult_teen, p.sup_pct, p.pt_range_min, p.pt_range_max);
  }

  // --- Demo Claims (various statuses) ---
  const claims = [
    {
      id: uuid(), patient_id: 'P-001', patient_name: 'Alex Johnson', age: 4, diagnosis: 'autism',
      status: 'submitted', recommended_hours: 30, tier: 3,
      assessment_data: JSON.stringify({ age: '4', diagnosis: 'autism', fiiDomains: { fii_communication: 3, fii_socialReciprocity: 3, fii_adaptiveSkills: 2, fii_emotionalRegulation: 2, fii_safetyAggression: 1, fii_selfInjury: 0, fii_schoolCommunity: 2, fii_familyImpact: 2, fii_rrb: 2 }, vineland: { communication: '65', dailyLiving: '68', socialization: '60', motor: '72', vinelandComposite: '65' }, vbmapp: { milestones: '35', barriers: '18', transition: '5' }, behavioral: { aggressionFreq: 'daily', selfInjury: 'mild', elopement: true, crisisEvents: '1' }, envModifiers: { env_regression: true, env_caregiverBurnout: true }, riskScores: { risk_selfHarm: 1, risk_harmOthers: 2, risk_elopement: 3, risk_safetyAwareness: 2 }, skillDeficits: ['Communication', 'Social Skills', 'Play Skills', 'Self-Care'] }),
      calc_result: JSON.stringify({ fii: 17, base: 20, vAdj: 8, vbAdj: 8, bAdj: 13, eAdj: 4, ageMult: 1.2, raw: 63.6, final: 40, tier: 3, supHrs: 8, ptHrs: 8, goals: 6, risk: 8, flags: [], rationale: ['FII: 17/36 → Base 20h', 'Vineland: +8.0h', 'VB-MAPP: +8.0h', 'Behavioral: +13.0h', 'Environmental: +4.0h', 'Age ×1.2 → 63.6 → 40h/wk'], highRisk: false }),
      ml_prediction: JSON.stringify({ probability: 72, confidence: 'high', tier: 'likely-approve', factors: [] }),
    },
    {
      id: uuid(), patient_id: 'P-002', patient_name: 'Maya Patel', age: 7, diagnosis: 'autism',
      status: 'under_review', recommended_hours: 25, tier: 2,
      assessment_data: JSON.stringify({ age: '7', diagnosis: 'autism', fiiDomains: { fii_communication: 2, fii_socialReciprocity: 3, fii_adaptiveSkills: 2, fii_emotionalRegulation: 1, fii_safetyAggression: 1, fii_selfInjury: 0, fii_schoolCommunity: 2, fii_familyImpact: 1, fii_rrb: 2 }, vineland: { communication: '72', dailyLiving: '75', socialization: '68', motor: '80', vinelandComposite: '72' }, vbmapp: { milestones: '65', barriers: '14', transition: '8' }, behavioral: { aggressionFreq: '6plus', selfInjury: 'none', elopement: false, crisisEvents: '0' }, envModifiers: { env_noSchool: true }, riskScores: {}, skillDeficits: ['Communication', 'Social Skills', 'Self-Care'] }),
      calc_result: JSON.stringify({ fii: 14, base: 20, vAdj: 4, vbAdj: 5, bAdj: 3, eAdj: 2, ageMult: 1.0, raw: 34, final: 25, tier: 2, supHrs: 4, ptHrs: 5, goals: 4, risk: 0, flags: [], rationale: ['FII: 14/36 → Base 20h', 'Vineland: +4.0h', 'VB-MAPP: +5.0h', 'Behavioral: +3.0h', 'Environmental: +2.0h', 'Age ×1.0 → 34.0 → 25h/wk'], highRisk: false }),
      ml_prediction: JSON.stringify({ probability: 65, confidence: 'medium', tier: 'borderline', factors: [] }),
    },
    {
      id: uuid(), patient_id: 'P-003', patient_name: 'Ethan Williams', age: 12, diagnosis: 'autism',
      status: 'approved', recommended_hours: 20, approved_hours: 20, tier: 2,
      assessment_data: JSON.stringify({}),
      calc_result: JSON.stringify({ fii: 12, base: 20, vAdj: 2, vbAdj: 2, bAdj: 0, eAdj: 0, ageMult: 1.0, raw: 24, final: 20, tier: 2, supHrs: 3, ptHrs: 5, goals: 3, risk: 2, flags: [], rationale: ['FII: 12/36 → Base 20h', 'Vineland: +2.0h', 'VB-MAPP: +2.0h', 'Age ×1.0 → 24.0 → 20h/wk'], highRisk: false }),
      ml_prediction: JSON.stringify({ probability: 78, confidence: 'high', tier: 'likely-approve', factors: [] }),
      review_notes: 'Meets medical necessity criteria. Approved as requested.',
    },
    {
      id: uuid(), patient_id: 'P-005', patient_name: 'Liam Chen', age: 15, diagnosis: 'aspergers',
      status: 'denied', recommended_hours: 15, tier: 1,
      assessment_data: JSON.stringify({}),
      calc_result: JSON.stringify({ fii: 8, base: 10, vAdj: 0, vbAdj: 1, bAdj: 0, eAdj: 0, ageMult: 0.85, raw: 9.35, final: 10, tier: 1, supHrs: 1, ptHrs: 2, goals: 2, risk: 0, flags: [], rationale: ['FII: 8/36 → Base 10h', 'VB-MAPP: +1.0h', 'Age ×0.85 → 9.4 → 10h/wk'], highRisk: false }),
      ml_prediction: JSON.stringify({ probability: 35, confidence: 'high', tier: 'likely-deny', factors: [] }),
      review_notes: 'Insufficient functional impairment documented for requested hours.',
    },
  ];

  const insertClaim = db.prepare(`
    INSERT INTO claims (id, patient_id, patient_name, age, diagnosis, status, assessment_data, calc_result, ml_prediction, recommended_hours, approved_hours, tier, review_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of claims) {
    insertClaim.run(c.id, c.patient_id, c.patient_name, c.age, c.diagnosis, c.status,
      c.assessment_data, c.calc_result, c.ml_prediction, c.recommended_hours,
      (c as any).approved_hours ?? null, c.tier, (c as any).review_notes ?? null);
  }

  console.log('✅ Seeded 5 patients, 3 payer profiles, 4 demo claims');
}
