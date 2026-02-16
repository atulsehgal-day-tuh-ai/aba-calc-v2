// ============================================================================
// ABA Medical Necessity Calculator — 7-Step Dosage Determination Engine
// Authoritative reference: Contract Section 4
// ============================================================================

// --- Constants ---

export const VINELAND_DOMAINS = [
  { key: 'communication', label: 'Communication' },
  { key: 'dailyLiving', label: 'Daily Living Skills' },
  { key: 'socialization', label: 'Socialization' },
  { key: 'motor', label: 'Motor Skills' },
] as const;

export const FII_DOMAINS = [
  { key: 'fii_communication', label: 'Communication' },
  { key: 'fii_socialReciprocity', label: 'Social Reciprocity' },
  { key: 'fii_adaptiveSkills', label: 'Adaptive Skills' },
  { key: 'fii_emotionalRegulation', label: 'Emotional Regulation' },
  { key: 'fii_safetyAggression', label: 'Safety / Aggression' },
  { key: 'fii_selfInjury', label: 'Self-Injury' },
  { key: 'fii_schoolCommunity', label: 'School / Community' },
  { key: 'fii_familyImpact', label: 'Family Impact' },
  { key: 'fii_rrb', label: 'Restricted / Repetitive Behaviors' },
] as const;

export const ENV_MODIFIERS = [
  { key: 'env_schoolRisk', label: 'School placement at risk' },
  { key: 'env_cps', label: 'CPS involvement' },
  { key: 'env_regression', label: 'Regression' },
  { key: 'env_caregiverBurnout', label: 'Caregiver burnout' },
  { key: 'env_lossABA', label: 'Loss of ABA services' },
  { key: 'env_limitedCaregiver', label: 'Limited caregiver capacity' },
  { key: 'env_noSchool', label: 'No school supports' },
] as const;

export const RISK_FACTORS = [
  { key: 'risk_selfHarm', label: 'Risk of harm to self' },
  { key: 'risk_harmOthers', label: 'Risk of harm to others' },
  { key: 'risk_elopement', label: 'Elopement / wandering' },
  { key: 'risk_safetyAwareness', label: 'Lack of safety awareness' },
  { key: 'risk_placement', label: 'Restrictive placement risk' },
  { key: 'risk_medical', label: 'Medical complexity' },
] as const;

export const SKILL_DEFICITS = [
  'Communication',
  'Social Skills',
  'Play Skills',
  'Self-Care',
  'Academic',
  'Motor Skills',
  'Executive Functioning',
  'Community/Safety',
] as const;

// --- Types ---

export interface PayerProfile {
  name: string;
  maxHours: number;
  minHours: number;
  fiiW: number;
  vinW: number;
  vbW: number;
  behW: number;
  envW: number;
  ageMult: { young: number; mid: number; teen: number };
  supPct: number;
  ptRange: [number, number];
}

export interface VinelandScores {
  communication: string;
  dailyLiving: string;
  socialization: string;
  motor: string;
  vinelandComposite: string;
}

export interface VBMAPPScores {
  milestones: string;
  barriers: string;
  transition: string;
}

export interface BehavioralData {
  aggressionFreq: string;
  selfInjury: string;
  elopement: boolean;
  crisisEvents: string;
}

export interface AssessmentFormData {
  age: string;
  diagnosis: string;
  educationalSetting?: string;
  livingSituation?: string;
  vineland: VinelandScores;
  vbmapp: VBMAPPScores;
  fiiDomains: Record<string, number>;
  skillDeficits: string[];
  behavioral: BehavioralData;
  envModifiers: Record<string, boolean>;
  riskScores: Record<string, number>;
  patientName?: string;
  patientId?: string;
}

export interface CalculationResult {
  fii: number;
  base: number;
  vAdj: number;
  vbAdj: number;
  bAdj: number;
  eAdj: number;
  ageMult: number;
  raw: number;
  final: number;
  tier: 1 | 2 | 3;
  supHrs: number;
  ptHrs: number;
  goals: number;
  risk: number;
  flags: string[];
  rationale: string[];
  highRisk: boolean;
}

export const DEFAULT_PAYER: PayerProfile = {
  name: 'Default',
  maxHours: 40,
  minHours: 10,
  fiiW: 1,
  vinW: 1,
  vbW: 1,
  behW: 1,
  envW: 1,
  ageMult: { young: 1.2, mid: 1.0, teen: 0.85 },
  supPct: 0.15,
  ptRange: [2, 8],
};

// --- Step 1: FII → Base Hours (Contract Section 4.1) ---

export function calcFII(domains: Record<string, number>): number {
  return Object.values(domains).reduce((sum, v) => sum + (Number(v) || 0), 0);
}

export function fiiBaseHours(fii: number): number {
  if (fii <= 8) return 10;
  if (fii <= 16) return 20;
  if (fii <= 24) return 30;
  return 35;
}

// --- Step 2: Vineland-3 Adjustment (Contract Section 4.2, max +12) ---

export function calcVineland(scores: VinelandScores): number {
  const vals = VINELAND_DOMAINS.map((d) => scores[d.key as keyof VinelandScores])
    .filter((v) => v !== '' && v !== undefined)
    .map(Number);

  if (!vals.length) return 0;

  const below85Count = vals.filter((v) => v < 85).length;
  const anyBelow70 = vals.some((v) => v < 70);
  const composite = scores.vinelandComposite ? Number(scores.vinelandComposite) : null;

  let adj = 0;
  if (below85Count === 1) adj = 2;
  else if (below85Count === 2) adj = 4;
  else if (below85Count === 3) adj = 6;
  else if (below85Count >= 4) adj = 8;

  if (anyBelow70) adj += 4;
  if (composite && composite < 70) adj += 4;

  return Math.min(adj, 12);
}

// --- Step 3: VB-MAPP Adjustment (Contract Section 4.3, max +12) ---

export function calcVBMAPP(scores: VBMAPPScores): number {
  let adj = 0;

  if (scores.milestones !== '' && scores.milestones !== undefined) {
    const m = Number(scores.milestones);
    if (m <= 45) adj += 6;
    else if (m <= 100) adj += 3;
  }

  if (scores.barriers !== '' && scores.barriers !== undefined) {
    const b = Number(scores.barriers);
    if (b >= 19) adj += 6;
    else if (b >= 13) adj += 4;
    else if (b >= 7) adj += 2;
  }

  if (scores.transition !== '' && scores.transition !== undefined) {
    const t = Number(scores.transition);
    if (t <= 6) adj += 2;
    else if (t <= 12) adj += 1;
  }

  return Math.min(adj, 12);
}

// --- Step 4: Behavioral Risk Adjustment (Contract Section 4.4, max +16) ---

export function calcBehavioral(data: BehavioralData): number {
  let adj = 0;

  if (data.aggressionFreq === 'daily') adj += 5;
  else if (data.aggressionFreq === '6plus') adj += 3;

  if (data.selfInjury === 'severe') adj += 8;
  else if (data.selfInjury === 'moderate') adj += 5;
  else if (data.selfInjury === 'mild') adj += 3;

  if (data.elopement) adj += 5;

  if (data.crisisEvents === '2plus') adj += 8;
  else if (data.crisisEvents === '1') adj += 5;

  return Math.min(adj, 16);
}

// --- Step 5: Environmental Adjustment (Contract Section 4.5, max +8) ---

export function calcEnvironmental(mods: Record<string, boolean>): number {
  const count = Object.values(mods).filter(Boolean).length;
  return Math.min(count * 2, 8);
}

// --- Step 6-7: Full Calculation (Contract Sections 4.6-4.7) ---

export function runCalculation(
  form: AssessmentFormData,
  payer: PayerProfile = DEFAULT_PAYER
): CalculationResult {
  // Step 1: FII → base hours
  const fii = calcFII(form.fiiDomains);
  const base = fiiBaseHours(fii);

  // Steps 2-5: Adjustments with payer weights
  const vAdj = calcVineland(form.vineland) * payer.vinW;
  const vbAdj = calcVBMAPP(form.vbmapp) * payer.vbW;
  const bAdj = calcBehavioral(form.behavioral) * payer.behW;
  const eAdj = calcEnvironmental(form.envModifiers) * payer.envW;

  // Risk score calculation
  const risk = RISK_FACTORS.reduce(
    (sum, r) => sum + (Number(form.riskScores[r.key]) || 0),
    0
  );

  // Step 6: Age multiplier with high-risk override
  const highRisk = risk >= 15 || form.behavioral.selfInjury === 'severe';
  const age = Number(form.age);
  const ageMult = highRisk
    ? 1.0
    : age <= 5
      ? payer.ageMult.young
      : age <= 12
        ? payer.ageMult.mid
        : payer.ageMult.teen;

  // Step 7: Final calculation — round to nearest 5, clamp
  const raw = (base + vAdj + vbAdj + bAdj + eAdj) * ageMult;
  const final = Math.max(
    payer.minHours,
    Math.min(payer.maxHours, Math.round(raw / 5) * 5)
  );

  // Output derivations (Contract Section 4.8)
  const tier: 1 | 2 | 3 = final >= 30 ? 3 : final >= 20 ? 2 : 1;
  const supPct = tier === 3 ? 0.2 : tier === 2 ? 0.15 : 0.1;
  const supHrs = Math.ceil(final * supPct);
  const ptHrs =
    tier === 3
      ? payer.ptRange[1]
      : tier === 2
        ? Math.round((payer.ptRange[0] + payer.ptRange[1]) / 2)
        : payer.ptRange[0];
  const goals = Math.min(
    12,
    Math.max(2, (form.skillDeficits?.length || 0) + (fii > 20 ? 2 : fii > 10 ? 1 : 0))
  );

  // Clinical flags
  const flags: string[] = [];
  if (risk >= 15) flags.push('HIGH RISK — Safety Plan Required');
  if (fii >= 25) flags.push('Severe Functional Impairment');
  if (bAdj >= 10) flags.push('Significant Behavioral Risk');
  if (eAdj >= 6) flags.push('Multiple Environmental Stressors');

  // Step-by-step rationale
  const rationale: string[] = [`FII: ${fii}/36 → Base ${base}h`];
  if (vAdj > 0) rationale.push(`Vineland: +${vAdj.toFixed(1)}h`);
  if (vbAdj > 0) rationale.push(`VB-MAPP: +${vbAdj.toFixed(1)}h`);
  if (bAdj > 0) rationale.push(`Behavioral: +${bAdj.toFixed(1)}h`);
  if (eAdj > 0) rationale.push(`Environmental: +${eAdj.toFixed(1)}h`);
  rationale.push(`Age ×${ageMult} → ${raw.toFixed(1)} → ${final}h/wk`);

  return {
    fii, base, vAdj, vbAdj, bAdj, eAdj, ageMult, raw, final,
    tier, supHrs, ptHrs, goals, risk, flags, rationale, highRisk,
  };
}
