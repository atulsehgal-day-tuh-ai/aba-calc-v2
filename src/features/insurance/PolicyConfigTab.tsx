import { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import { InputField } from '../../components/Field.tsx';
import { Section } from '../../components/Section.tsx';
import { Badge } from '../../components/Badge.tsx';
import { Settings, Save, AlertTriangle } from 'lucide-react';
import type { PayerProfile } from '../../lib/calculator.ts';

interface PolicyProfile extends PayerProfile {
  id?: string;
}

export function PolicyConfigTab() {
  const [profiles, setProfiles] = useState<PolicyProfile[]>([]);
  const [selected, setSelected] = useState<PolicyProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.getPayerProfiles()
      .then((data) => {
        if (cancelled) return;
        setProfiles(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load payer profiles');
      });
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    if (!selected?.id) return;
    setSaving(true);
    try {
      await api.updatePayerProfile(selected.id, selected);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: keyof PolicyProfile, val: any) => {
    if (!selected) return;
    setSelected({ ...selected, [key]: val });
  };

  if (error) {
    return (
      <div className="text-center py-12 animate-fadeIn">
        <div className="w-14 h-14 rounded-full bg-critical-light flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={24} className="text-critical" />
        </div>
        <p className="text-sm text-critical font-medium">{error}</p>
        <button onClick={() => { setError(null); api.getPayerProfiles().then((data) => { setProfiles(data); if (data.length > 0) setSelected(data[0]); }).catch((e) => setError(e.message)); }}
          className="btn-secondary btn-sm mt-4">
          Retry
        </button>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-32 w-full" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5 animate-fadeIn">
      {/* Profile Selector */}
      <div className="flex items-center gap-3 mb-2">
        <Settings size={18} className="text-primary" />
        <h3 className="text-base font-semibold text-heading">Policy Configuration</h3>
        <div className="flex gap-2 ml-auto">
          {profiles.map((p) => (
            <button key={p.id || p.name} onClick={() => setSelected(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border-[1.5px] transition-all focus-ring ${
                selected.name === p.name
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-border text-text-secondary hover:border-primary hover:text-primary'
              }`}>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <Section title="Hour Limits" color="insurance">
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Maximum Hours/Week" type="number"
            value={selected.maxHours?.toString() ?? ''} onChange={(e) => updateField('maxHours', Number(e.currentTarget.value))} />
          <InputField label="Minimum Hours/Week" type="number"
            value={selected.minHours?.toString() ?? ''} onChange={(e) => updateField('minHours', Number(e.currentTarget.value))} />
        </div>
      </Section>

      <Section title="Domain Weights" color="insurance">
        <p className="text-xs text-text-secondary mb-3">Adjust how heavily each domain influences the final calculation (1.0 = standard)</p>
        <div className="grid grid-cols-3 gap-4">
          <InputField label="FII Weight" type="number" step="0.1"
            value={selected.fiiW?.toString() ?? ''} onChange={(e) => updateField('fiiW', Number(e.currentTarget.value))} />
          <InputField label="Vineland Weight" type="number" step="0.1"
            value={selected.vinW?.toString() ?? ''} onChange={(e) => updateField('vinW', Number(e.currentTarget.value))} />
          <InputField label="VB-MAPP Weight" type="number" step="0.1"
            value={selected.vbW?.toString() ?? ''} onChange={(e) => updateField('vbW', Number(e.currentTarget.value))} />
          <InputField label="Behavioral Weight" type="number" step="0.1"
            value={selected.behW?.toString() ?? ''} onChange={(e) => updateField('behW', Number(e.currentTarget.value))} />
          <InputField label="Environmental Weight" type="number" step="0.1"
            value={selected.envW?.toString() ?? ''} onChange={(e) => updateField('envW', Number(e.currentTarget.value))} />
        </div>
      </Section>

      <Section title="Age Multipliers" color="insurance">
        <div className="grid grid-cols-3 gap-4">
          <InputField label="Young (≤5)" type="number" step="0.05"
            value={selected.ageMult?.young?.toString() ?? ''} onChange={(e) => updateField('ageMult', { ...selected.ageMult, young: Number(e.currentTarget.value) })} />
          <InputField label="Mid (6–12)" type="number" step="0.05"
            value={selected.ageMult?.mid?.toString() ?? ''} onChange={(e) => updateField('ageMult', { ...selected.ageMult, mid: Number(e.currentTarget.value) })} />
          <InputField label="Teen (13+)" type="number" step="0.05"
            value={selected.ageMult?.teen?.toString() ?? ''} onChange={(e) => updateField('ageMult', { ...selected.ageMult, teen: Number(e.currentTarget.value) })} />
        </div>
      </Section>

      <Section title="Supervision & Parent Training" color="insurance">
        <div className="grid grid-cols-3 gap-4">
          <InputField label="Supervision %" type="number" step="0.01"
            value={selected.supPct?.toString() ?? ''} onChange={(e) => updateField('supPct', Number(e.currentTarget.value))} />
          <InputField label="Parent Training Min" type="number"
            value={selected.ptRange?.[0]?.toString() ?? ''} onChange={(e) => updateField('ptRange', [Number(e.currentTarget.value), selected.ptRange?.[1] || 8])} />
          <InputField label="Parent Training Max" type="number"
            value={selected.ptRange?.[1]?.toString() ?? ''} onChange={(e) => updateField('ptRange', [selected.ptRange?.[0] || 2, Number(e.currentTarget.value)])} />
        </div>
      </Section>

      {/* Save Button */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          <Save size={16} />
          {saving ? 'Saving…' : 'Save Configuration'}
        </button>
        {saved && <Badge variant="success">Saved!</Badge>}
      </div>
    </div>
  );
}
