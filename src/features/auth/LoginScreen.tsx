import { Brain, Building2, Shield } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore.ts';

export function LoginScreen() {
  const setRole = useAuthStore((s) => s.setRole);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border mb-4">
            <Brain size={32} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text">ABA Medical Necessity Calculator</h1>
          <p className="text-muted text-sm mt-2">
            Evidence-based dosage determination for ABA therapy
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setRole('clinic', 'Dr. Sarah Chen')}
            className="group bg-card border border-border rounded-xl p-6 text-left
              hover:border-clinic/50 hover:bg-clinic-soft transition-all"
          >
            <Building2 size={28} className="text-clinic mb-3" />
            <h3 className="text-base font-semibold text-text mb-1">Provider Clinic</h3>
            <p className="text-xs text-muted leading-relaxed">
              Run assessments, calculate dosage, submit claims for authorization
            </p>
          </button>

          <button
            onClick={() => setRole('insurance', 'Claims Reviewer')}
            className="group bg-card border border-border rounded-xl p-6 text-left
              hover:border-insur/50 hover:bg-insur-soft transition-all"
          >
            <Shield size={28} className="text-insur mb-3" />
            <h3 className="text-base font-semibold text-text mb-1">Insurance Payer</h3>
            <p className="text-xs text-muted leading-relaxed">
              Review claims, validate calculations, manage policy configurations
            </p>
          </button>
        </div>

        <p className="text-center text-dim text-xs mt-8">
          Demo Prototype — Select a role to begin
        </p>
      </div>
    </div>
  );
}
