import { useState, useMemo } from 'react';
import { Section } from '../../components/Section.tsx';
import { InputField, SelectField } from '../../components/Field.tsx';
import { RatingRow } from '../../components/RatingRow.tsx';
import { Chips } from '../../components/Chips.tsx';
import { Badge } from '../../components/Badge.tsx';
import { Meter } from '../../components/Meter.tsx';
import { StatCard } from '../../components/StatCard.tsx';
import {
  runCalculation,
  FII_DOMAINS,
  VINELAND_DOMAINS,
  ENV_MODIFIERS,
  RISK_FACTORS,
  SKILL_DEFICITS,
  DEFAULT_PAYER,
  type AssessmentFormData,
} from '../../lib/calculator.ts';
import { predictApproval } from '../../lib/mlPredictor.ts';
import { useClaimStore } from '../../stores/claimStore.ts';
import {
  Calculator, Activity, Brain, AlertTriangle, ClipboardList, Send,
  Target, Shield, TrendingUp, BarChart3, CheckCircle2
} from 'lucide-react';

const EMPTY_FORM: AssessmentFormData = {
  patientName: '',
  patientId: '',
  age: '',
  diagnosis: 'autism',
  educationalSetting: '',
  livingSituation: '',
  vineland: { communication: '', dailyLiving: '', socialization: '', motor: '', vinelandComposite: '' },
  vbmapp: { milestones: '', barriers: '', transition: '' },
  fiiDomains: {},
  skillDeficits: [],
  behavioral: { aggressionFreq: '', selfInjury: '', elopement: false, crisisEvents: '' },
  envModifiers: {},
  riskScores: {},
};

export function CalculatorTab() {
  const [form, setForm] = useState<AssessmentFormData>({ ...EMPTY_FORM });
  const [submitted, setSubmitted] = useState(false);
  const submitClaim = useClaimStore((s) => s.submitClaim);

  // Live calculation
  const calc = useMemo(() => {
    const age = Number(form.age);
    if (!age || age < 1) return null;
    return runCalculation(form, DEFAULT_PAYER);
  }, [form]);

  const prediction = useMemo(() => {
    if (!calc) return null;
    return predictApproval(form, calc);
  }, [form, calc]);

  // Form updaters
  const setField = <K extends keyof AssessmentFormData>(key: K, val: AssessmentFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const setVineland = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, vineland: { ...prev.vineland, [key]: val } }));

  const setVBMAPP = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, vbmapp: { ...prev.vbmapp, [key]: val } }));

  const setFII = (key: string, val: number) =>
    setForm((prev) => ({ ...prev, fiiDomains: { ...prev.fiiDomains, [key]: val } }));

  const setBeh = (key: string, val: any) =>
    setForm((prev) => ({ ...prev, behavioral: { ...prev.behavioral, [key]: val } }));

  const setEnv = (key: string, val: boolean) =>
    setForm((prev) => ({ ...prev, envModifiers: { ...prev.envModifiers, [key]: val } }));

  const setRisk = (key: string, val: number) =>
    setForm((prev) => ({ ...prev, riskScores: { ...prev.riskScores, [key]: val } }));

  const handleSubmit = async () => {
    if (!calc) return;
    try {
      await submitClaim({
        patient_name: form.patientName || 'Demo Patient',
        patient_id: form.patientId || `P-${Date.now()}`,
        age: Number(form.age),
        diagnosis: form.diagnosis,
        assessment_data: JSON.stringify(form),
        calc_result: JSON.stringify(calc),
        ml_prediction: JSON.stringify(prediction),
        recommended_hours: calc.final,
        tier: calc.tier,
      });
      setSubmitted(true);
    } catch {
      // Error is handled in the store
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-success" />
        </div>
        <h2 className="text-xl font-bold text-heading mb-2">Claim Submitted!</h2>
        <p className="text-text-secondary text-sm mb-6">Your authorization request is now in the insurance review queue.</p>
        <button
          onClick={() => { setSubmitted(false); setForm({ ...EMPTY_FORM }); }}
          className="btn-primary"
        >
          Start New Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* LEFT: Form (2/3 width) */}
      <div className="col-span-2 space-y-5">
        {/* Section 1: Demographics */}
        <Section title="Patient Demographics" stepNumber={1}>
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Patient Name" placeholder="e.g. Alex Johnson"
              value={form.patientName} onChange={(e) => setField('patientName', e.currentTarget.value)} />
            <InputField label="Patient ID" placeholder="MRN or ID"
              value={form.patientId} onChange={(e) => setField('patientId', e.currentTarget.value)} />
            <InputField label="Age" type="number" placeholder="2–21" min={2} max={21}
              value={form.age} onChange={(e) => setField('age', e.currentTarget.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <SelectField label="Diagnosis" value={form.diagnosis}
              onChange={(e) => setField('diagnosis', e.currentTarget.value)}
              options={[
                { value: 'autism', label: 'Autism Spectrum Disorder (F84.0)' },
                { value: 'pdd', label: 'PDD-NOS' },
                { value: 'aspergers', label: "Asperger's Syndrome" },
                { value: 'other', label: 'Other ASD' },
              ]} />
            <SelectField label="Educational Setting" value={form.educationalSetting ?? ''}
              onChange={(e) => setField('educationalSetting', e.currentTarget.value)}
              options={[
                { value: 'mainstream', label: 'Mainstream' },
                { value: 'supported', label: 'Supported Mainstream' },
                { value: 'special-ed', label: 'Special Education' },
                { value: 'home', label: 'Home-Based' },
                { value: 'not-enrolled', label: 'Not Enrolled' },
              ]} />
            <SelectField label="Living Situation" value={form.livingSituation ?? ''}
              onChange={(e) => setField('livingSituation', e.currentTarget.value)}
              options={[
                { value: 'two-parent', label: 'Two-Parent Home' },
                { value: 'single-parent', label: 'Single-Parent Home' },
                { value: 'foster', label: 'Foster Care' },
                { value: 'group', label: 'Group Home' },
                { value: 'other', label: 'Other' },
              ]} />
          </div>
        </Section>

        {/* Section 2: Functional Impairment Index */}
        <Section title="Functional Impairment Index (FII)" stepNumber={2}
          badge={calc && <Badge variant={calc.fii >= 20 ? 'danger' : calc.fii >= 12 ? 'warn' : 'success'}>{calc.fii}/36</Badge>}>
          <p className="text-xs text-text-secondary mb-3">Rate each domain 0 (none) to 4 (profound)</p>
          {FII_DOMAINS.map((d) => (
            <RatingRow
              key={d.key}
              label={d.label}
              value={form.fiiDomains[d.key] || 0}
              onChange={(v) => setFII(d.key, v)}
              descriptions={['None', 'Mild', 'Moderate', 'Severe', 'Profound']}
            />
          ))}
        </Section>

        {/* Section 3: Vineland-3 */}
        <Section title="Vineland-3 Adaptive Behavior" stepNumber={3}
          badge={calc && calc.vAdj > 0 && <Badge variant="warn">+{calc.vAdj.toFixed(1)}h</Badge>}>
          <div className="grid grid-cols-2 gap-4">
            {VINELAND_DOMAINS.map((d) => (
              <InputField
                key={d.key}
                label={`${d.label} Standard Score`}
                type="number"
                placeholder="20–160"
                value={form.vineland[d.key as keyof typeof form.vineland] || ''}
                onChange={(e) => setVineland(d.key, e.currentTarget.value)}
              />
            ))}
            <InputField
              label="Adaptive Behavior Composite"
              type="number"
              placeholder="20–160"
              value={form.vineland.vinelandComposite}
              onChange={(e) => setVineland('vinelandComposite', e.currentTarget.value)}
              className="col-span-2"
            />
          </div>
        </Section>

        {/* Section 4: VB-MAPP */}
        <Section title="VB-MAPP Assessment" stepNumber={4}
          badge={calc && calc.vbAdj > 0 && <Badge variant="warn">+{calc.vbAdj.toFixed(1)}h</Badge>}>
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Milestones Score" type="number" placeholder="0–170"
              value={form.vbmapp.milestones}
              onChange={(e) => setVBMAPP('milestones', e.currentTarget.value)}
              hint="Lower = more delayed" />
            <InputField label="Barriers Score" type="number" placeholder="0–24"
              value={form.vbmapp.barriers}
              onChange={(e) => setVBMAPP('barriers', e.currentTarget.value)}
              hint="Higher = more barriers" />
            <InputField label="Transition Score" type="number" placeholder="0–18"
              value={form.vbmapp.transition}
              onChange={(e) => setVBMAPP('transition', e.currentTarget.value)}
              hint="Lower = less ready" />
          </div>
        </Section>

        {/* Section 5: Skill Deficits */}
        <Section title="Skill Deficit Domains" stepNumber={5}>
          <Chips
            options={SKILL_DEFICITS}
            selected={form.skillDeficits}
            onChange={(s) => setField('skillDeficits', s)}
          />
        </Section>

        {/* Section 6: Behavioral Assessment */}
        <Section title="Behavioral Assessment" stepNumber={6}
          badge={calc && calc.bAdj > 0 && <Badge variant="danger">+{calc.bAdj.toFixed(1)}h</Badge>}>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Aggression Frequency"
              value={form.behavioral.aggressionFreq}
              onChange={(e) => setBeh('aggressionFreq', e.currentTarget.value)}
              options={[
                { value: 'none', label: 'None' },
                { value: 'monthly', label: 'Monthly' },
                { value: '6plus', label: '6+ per month' },
                { value: 'daily', label: 'Daily' },
              ]} />
            <SelectField label="Self-Injury Severity"
              value={form.behavioral.selfInjury}
              onChange={(e) => setBeh('selfInjury', e.currentTarget.value)}
              options={[
                { value: 'none', label: 'None' },
                { value: 'mild', label: 'Mild' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'severe', label: 'Severe / Tissue Damage' },
              ]} />
            <SelectField label="Crisis Events (Past 6 months)"
              value={form.behavioral.crisisEvents}
              onChange={(e) => setBeh('crisisEvents', e.currentTarget.value)}
              options={[
                { value: '0', label: 'None' },
                { value: '1', label: '1 event' },
                { value: '2plus', label: '2+ events' },
              ]} />
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.behavioral.elopement}
                  onChange={(e) => setBeh('elopement', e.currentTarget.checked)}
                  className="w-4 h-4 rounded border-border-input accent-secondary" />
                <span className="text-sm text-body">Elopement / Wandering</span>
              </label>
            </div>
          </div>
        </Section>

        {/* Section 7: Environmental Factors */}
        <Section title="Environmental Modifiers" stepNumber={7}
          badge={calc && calc.eAdj > 0 && <Badge variant="warn">+{calc.eAdj.toFixed(1)}h</Badge>}>
          <div className="grid grid-cols-2 gap-3">
            {ENV_MODIFIERS.map((m) => (
              <label key={m.key} className="flex items-center gap-2.5 cursor-pointer py-1.5">
                <input type="checkbox" checked={form.envModifiers[m.key] || false}
                  onChange={(e) => setEnv(m.key, e.currentTarget.checked)}
                  className="w-4 h-4 rounded border-border-input accent-secondary" />
                <span className="text-sm text-body">{m.label}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* Section 8: Risk Assessment */}
        <Section title="Risk Assessment" stepNumber={8}
          badge={calc && calc.risk >= 15 && <Badge variant="danger">HIGH RISK</Badge>}>
          <p className="text-xs text-text-secondary mb-3">Rate each risk factor 0 (none) to 4 (extreme)</p>
          {RISK_FACTORS.map((r) => (
            <RatingRow
              key={r.key}
              label={r.label}
              value={form.riskScores[r.key] || 0}
              onChange={(v) => setRisk(r.key, v)}
              descriptions={['None', 'Low', 'Moderate', 'High', 'Extreme']}
            />
          ))}
        </Section>
      </div>

      {/* RIGHT: Results Panel (1/3 width, sticky) */}
      <div className="space-y-5">
        <div className="sticky top-20 space-y-5">
          {/* Calculation Result */}
          {calc ? (
            <>
              <div className="card !border-l-4 !border-l-secondary animate-fadeIn">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator size={18} className="text-secondary" />
                  <h3 className="text-sm font-semibold text-subheading">Dosage Recommendation</h3>
                </div>
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-secondary">{calc.final}</div>
                  <div className="text-sm text-text-secondary mt-1">hours / week</div>
                  <div className="mt-2">
                    <Badge variant={calc.tier === 3 ? 'danger' : calc.tier === 2 ? 'warn' : 'success'}>
                      Tier {calc.tier} — {calc.tier === 3 ? 'Intensive' : calc.tier === 2 ? 'Moderate' : 'Focused'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-border pt-3">
                  {calc.rationale.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-text-secondary">
                      <span className="text-secondary mt-0.5 font-bold">›</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Supervision" value={`${calc.supHrs}h`} sublabel="per week" icon={<Target size={16} />} />
                <StatCard label="Parent Training" value={`${calc.ptHrs}h`} sublabel="per week" icon={<Activity size={16} />} />
                <StatCard label="Goals" value={calc.goals} sublabel="recommended" icon={<ClipboardList size={16} />} />
                <StatCard label="Risk Score" value={`${calc.risk}/24`}
                  color={calc.risk >= 15 ? 'danger' : calc.risk >= 8 ? 'warn' : 'clinic'}
                  icon={<AlertTriangle size={16} />} />
              </div>

              {/* Flags */}
              {calc.flags.length > 0 && (
                <div className="card !bg-critical-light !border-critical/30">
                  <h4 className="text-xs font-semibold text-critical mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Clinical Flags
                  </h4>
                  {calc.flags.map((f, i) => (
                    <div key={i} className="text-xs text-critical/80 py-0.5">• {f}</div>
                  ))}
                </div>
              )}

              {/* ML Prediction */}
              {prediction && (
                <div className="card !border-l-4 !border-l-primary animate-fadeIn">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain size={18} className="text-primary" />
                    <h3 className="text-sm font-semibold text-subheading">Approval Predictor</h3>
                    <Badge variant="purple">AI</Badge>
                  </div>
                  <div className="text-center mb-3">
                    <div className={`text-3xl font-bold ${prediction.tier === 'likely-approve' ? 'text-success' :
                      prediction.tier === 'borderline' ? 'text-warning' : 'text-critical'}`}>
                      {prediction.probability}%
                    </div>
                    <div className="text-xs text-text-secondary">Est. Approval Probability</div>
                  </div>
                  <Meter
                    value={prediction.probability}
                    color={prediction.tier === 'likely-approve' ? 'success' :
                      prediction.tier === 'borderline' ? 'warn' : 'danger'}
                    size="sm"
                  />
                  <div className="mt-3 space-y-1.5">
                    {prediction.factors.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className={f.impact === 'positive' ? 'text-success' : f.impact === 'negative' ? 'text-critical' : 'text-text-secondary'}>
                          {f.impact === 'positive' ? '✓' : f.impact === 'negative' ? '✗' : '–'}
                        </span>
                        <span className="text-text-secondary">{f.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="btn-primary w-full justify-center !py-3"
              >
                <Send size={16} />
                Submit for Authorization
              </button>
            </>
          ) : (
            <div className="card text-center !py-12">
              <BarChart3 size={32} className="text-disabled mx-auto mb-3" />
              <p className="text-sm text-text-secondary">Enter patient age to see live calculation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
