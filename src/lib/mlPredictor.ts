// ============================================================================
// Simulated ML Predictor — Deterministic Heuristic for Demo
// Approximates approval probability based on clinical data completeness
// ============================================================================

import type { AssessmentFormData, CalculationResult } from './calculator.ts';

export interface PredictionResult {
  probability: number;       // 0–100
  confidence: 'low' | 'medium' | 'high';
  factors: PredictionFactor[];
  tier: 'likely-approve' | 'borderline' | 'likely-deny';
}

export interface PredictionFactor {
  label: string;
  impact: 'positive' | 'negative' | 'neutral';
  detail: string;
}

export function predictApproval(
  form: AssessmentFormData,
  calc: CalculationResult
): PredictionResult {
  let score = 50; // baseline
  const factors: PredictionFactor[] = [];

  // 1. FII severity (higher = more justified)
  if (calc.fii >= 20) {
    score += 15;
    factors.push({ label: 'FII Score', impact: 'positive', detail: `High severity (${calc.fii}/36) strongly supports necessity` });
  } else if (calc.fii >= 12) {
    score += 5;
    factors.push({ label: 'FII Score', impact: 'positive', detail: `Moderate severity (${calc.fii}/36) supports necessity` });
  } else {
    score -= 10;
    factors.push({ label: 'FII Score', impact: 'negative', detail: `Low severity (${calc.fii}/36) may weaken medical necessity` });
  }

  // 2. Vineland data present and significant
  const vinelandComposite = Number(form.vineland.vinelandComposite);
  if (vinelandComposite && vinelandComposite < 70) {
    score += 12;
    factors.push({ label: 'Vineland-3', impact: 'positive', detail: `Composite ${vinelandComposite} (< 70) strongly supports` });
  } else if (vinelandComposite && vinelandComposite < 85) {
    score += 5;
    factors.push({ label: 'Vineland-3', impact: 'positive', detail: `Composite ${vinelandComposite} supports necessity` });
  } else if (!vinelandComposite) {
    score -= 5;
    factors.push({ label: 'Vineland-3', impact: 'negative', detail: 'No Vineland data — payers often require standardized assessment' });
  }

  // 3. VB-MAPP data present
  if (form.vbmapp.milestones !== '' || form.vbmapp.barriers !== '') {
    score += 5;
    factors.push({ label: 'VB-MAPP', impact: 'positive', detail: 'Standardized VB-MAPP data strengthens claim' });
  } else {
    score -= 3;
    factors.push({ label: 'VB-MAPP', impact: 'negative', detail: 'Missing VB-MAPP data — recommend adding' });
  }

  // 4. Behavioral severity
  if (calc.bAdj >= 10) {
    score += 10;
    factors.push({ label: 'Behavioral Risk', impact: 'positive', detail: 'Significant behavioral concerns justify intensive services' });
  } else if (calc.bAdj >= 5) {
    score += 3;
    factors.push({ label: 'Behavioral Risk', impact: 'positive', detail: 'Moderate behavioral concerns noted' });
  }

  // 5. Hours within typical range
  if (calc.final <= 20) {
    score += 5;
    factors.push({ label: 'Requested Hours', impact: 'positive', detail: `${calc.final}h/wk within conservative range` });
  } else if (calc.final > 30) {
    score -= 5;
    factors.push({ label: 'Requested Hours', impact: 'negative', detail: `${calc.final}h/wk — higher requests face more scrutiny` });
  } else {
    factors.push({ label: 'Requested Hours', impact: 'neutral', detail: `${calc.final}h/wk is within moderate range` });
  }

  // 6. Skill deficits documented
  if ((form.skillDeficits?.length || 0) >= 4) {
    score += 5;
    factors.push({ label: 'Skill Deficits', impact: 'positive', detail: `${form.skillDeficits.length} domains documented` });
  } else if ((form.skillDeficits?.length || 0) >= 2) {
    score += 2;
    factors.push({ label: 'Skill Deficits', impact: 'neutral', detail: `${form.skillDeficits?.length || 0} domains — consider documenting more` });
  }

  // 7. High-risk flag
  if (calc.highRisk) {
    score += 8;
    factors.push({ label: 'Safety Risk', impact: 'positive', detail: 'High-risk flag strengthens medical necessity' });
  }

  // Clamp
  const probability = Math.max(15, Math.min(95, score));

  const confidence: PredictionResult['confidence'] =
    probability >= 70 || probability <= 35 ? 'high' : 'medium';

  const tier: PredictionResult['tier'] =
    probability >= 70
      ? 'likely-approve'
      : probability >= 45
        ? 'borderline'
        : 'likely-deny';

  return { probability, confidence, factors, tier };
}
