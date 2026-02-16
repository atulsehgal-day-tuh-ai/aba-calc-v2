import { useState, useMemo } from 'react';
import { Section } from '../../components/Section.tsx';
import { InputField, SelectField } from '../../components/Field.tsx';
import { RatingRow } from '../../components/RatingRow.tsx';
import { Chips } from '../../components/Chips.tsx';
import { Badge } from '../../components/Badge.tsx';
import { Meter } from '../../components/Meter.tsx';
import { StatCard } from '../../components/StatCard.tsx';
import {
  runCalculation, FII_DOMAINS, VINELAND_DOMAINS, ENV_MODIFIERS, RISK_FACTORS,
  SKILL_DEFICITS, DEFAULT_PAYER,
  type AssessmentFormData, type PayerProfile,
} from '../../lib/calculator.ts';
import { predictApproval } from '../../lib/mlPredictor.ts';
import { Calculator, Target, Activity, ClipboardList, AlertTriangle } from 'lucide-react';

const EMPTY_FORM: AssessmentFormData = {
  age: '', diagnosis: 'autism',
  vineland: { communication: '', dailyLiving: '', socialization: '', motor: '', vinelandComposite: '' },
  vbmapp: { milestones: '', barriers: '', transition: '' },
  fiiDomains: {}, skillDeficits: [],
  behavioral: { aggressionFreq: '', selfInjury: '', elopement: false, crisisEvents: '' },
  envModifiers: {}, riskScores: {},
};

export function PolicyCalcTab() {
  const [form, setForm] = useState<AssessmentFormData>({ ...EMPTY_FORM });

  // Allow payer weight overrides
  const [payerOverrides, setPayerOverrides] = useState<Partial<PayerProfile>>({});
  const payer = useMemo(() => ({ ...DEFAULT_PAYER, ...payerOverrides }), [payerOverrides]);

  const calc = useMemo(() => {
    const age = Number(form.age);
    if (!age || age < 1) return null;
    return runCalculation(form, payer);
  }, [form, payer]);

  const prediction = useMemo(() => {
    if (!calc) return null;
    return predictApproval(form, calc);
  }, [form, calc]);

  const setField = <K extends keyof AssessmentFormData>(key: K, val: AssessmentFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));
  const setFII = (key: string, val: number) =>
    setForm((prev) => ({ ...prev, fiiDomains: { ...prev.fiiDomains, [key]: val } }));
  const setVineland = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, vineland: { ...prev.vineland, [key]: val } }));
  const setVBMAPP = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, vbmapp: { ...prev.vbmapp, [key]: val } }));
  const setBeh = (key: string, val: any) =>
    setForm((prev) => ({ ...prev, behavioral: { ...prev.behavioral, [key]: val } }));
  const setEnv = (key: string, val: boolean) =>
    setForm((prev) => ({ ...prev, envModifiers: { ...prev.envModifiers, [key]: val } }));
  const setRisk = (key: string, val: number) =>
    setForm((prev) => ({ ...prev, riskScores: { ...prev.riskScores, [key]: val } }));

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-4">
        {/* Quick Demographics */}
        <Section title="Scenario Input" color="insurance">
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Age" type="number" value={form.age}
              onChange={(e) => setField('age', e.currentTarget.value)} placeholder="2–21" />
            <SelectField label="Diagnosis" value={form.diagnosis}
              onChange={(e) => setField('diagnosis', e.currentTarget.value)}
              options={[
                { value: 'autism', label: 'ASD (F84.0)' },
                { value: 'pdd', label: 'PDD-NOS' },
                { value: 'aspergers', label: "Asperger's" },
              ]} />
            <InputField label="Max Hours Override" type="number"
              value={payerOverrides.maxHours?.toString() ?? ''}
              onChange={(e) => setPayerOverrides(p => ({ ...p, maxHours: Number(e.currentTarget.value) || undefined }))}
              placeholder={`${DEFAULT_PAYER.maxHours}`} hint="Policy max" />
          </div>
        </Section>

        {/* FII */}
        <Section title="Functional Impairment Index" color="insurance"
          badge={calc && <Badge variant="purple">{calc.fii}/36</Badge>}>
          {FII_DOMAINS.map((d) => (
            <RatingRow key={d.key} label={d.label}
              value={form.fiiDomains[d.key] || 0}
              onChange={(v) => setFII(d.key, v)} color="insurance"
              descriptions={['None', 'Mild', 'Moderate', 'Severe', 'Profound']} />
          ))}
        </Section>

        {/* Vineland */}
        <Section title="Vineland-3" color="insurance">
          <div className="grid grid-cols-2 gap-4">
            {VINELAND_DOMAINS.map((d) => (
              <InputField key={d.key} label={d.label} type="number" placeholder="20–160"
                value={form.vineland[d.key as keyof typeof form.vineland] || ''}
                onChange={(e) => setVineland(d.key, e.currentTarget.value)} />
            ))}
            <InputField label="Composite" type="number" placeholder="20–160"
              value={form.vineland.vinelandComposite}
              onChange={(e) => setVineland('vinelandComposite', e.currentTarget.value)} />
          </div>
        </Section>

        {/* VB-MAPP */}
        <Section title="VB-MAPP" color="insurance">
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Milestones" type="number" value={form.vbmapp.milestones}
              onChange={(e) => setVBMAPP('milestones', e.currentTarget.value)} placeholder="0–170" />
            <InputField label="Barriers" type="number" value={form.vbmapp.barriers}
              onChange={(e) => setVBMAPP('barriers', e.currentTarget.value)} placeholder="0–24" />
            <InputField label="Transition" type="number" value={form.vbmapp.transition}
              onChange={(e) => setVBMAPP('transition', e.currentTarget.value)} placeholder="0–18" />
          </div>
        </Section>

        {/* Behavioral */}
        <Section title="Behavioral Risk" color="insurance">
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Aggression" value={form.behavioral.aggressionFreq}
              onChange={(e) => setBeh('aggressionFreq', e.currentTarget.value)}
              options={[{ value: 'none', label: 'None' }, { value: 'monthly', label: 'Monthly' }, { value: '6plus', label: '6+/mo' }, { value: 'daily', label: 'Daily' }]} />
            <SelectField label="Self-Injury" value={form.behavioral.selfInjury}
              onChange={(e) => setBeh('selfInjury', e.currentTarget.value)}
              options={[{ value: 'none', label: 'None' }, { value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }]} />
          </div>
        </Section>

        {/* Environmental */}
        <Section title="Environmental" color="insurance">
          <div className="grid grid-cols-2 gap-3">
            {ENV_MODIFIERS.map((m) => (
              <label key={m.key} className="flex items-center gap-2 cursor-pointer py-1">
                <input type="checkbox" checked={form.envModifiers[m.key] || false}
                  onChange={(e) => setEnv(m.key, e.currentTarget.checked)}
                  className="w-4 h-4 rounded accent-insur" />
                <span className="text-sm text-text">{m.label}</span>
              </label>
            ))}
          </div>
        </Section>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="sticky top-6 space-y-4">
          {calc ? (
            <>
              <div className="bg-card rounded-xl border border-insur/30 p-5 animate-fadeIn">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator size={18} className="text-insur" />
                  <h3 className="text-sm font-semibold text-text">Policy Calculation</h3>
                </div>
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-insur">{calc.final}</div>
                  <div className="text-sm text-muted">hours / week</div>
                  <Badge variant="purple" className="mt-2">
                    Tier {calc.tier}
                  </Badge>
                </div>
                <div className="space-y-2 text-xs">
                  {calc.rationale.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-muted">
                      <span className="text-insur">›</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Supervision" value={`${calc.supHrs}h`} color="insurance" icon={<Target size={16} />} />
                <StatCard label="Parent Training" value={`${calc.ptHrs}h`} color="insurance" icon={<Activity size={16} />} />
              </div>

              {prediction && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="text-xs text-muted mb-2">Approval Estimate</div>
                  <Meter value={prediction.probability}
                    color={prediction.tier === 'likely-approve' ? 'success' : prediction.tier === 'borderline' ? 'warn' : 'danger'}
                    label={`${prediction.probability}%`} />
                </div>
              )}
            </>
          ) : (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Calculator size={32} className="text-dim mx-auto mb-3" />
              <p className="text-sm text-muted">Enter age to begin scenario analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
