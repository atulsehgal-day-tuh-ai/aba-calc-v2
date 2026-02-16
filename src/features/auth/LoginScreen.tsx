import { Brain, Building2, Shield } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore.ts';

export function LoginScreen() {
  const setRole = useAuthStore((s) => s.setRole);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg">
      <div className="max-w-lg w-full animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border shadow-sm mb-4">
            <Brain size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-heading">ABA Medical Necessity Calculator</h1>
          <p className="text-text-secondary text-sm mt-2">
            Evidence-based dosage determination for ABA therapy
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => setRole('clinic', 'Dr. Sarah Chen')}
            className="group card card-hover text-left !p-6
              hover:border-secondary transition-all focus-ring"
          >
            <div className="w-11 h-11 rounded-lg bg-clinic-light flex items-center justify-center mb-4">
              <Building2 size={22} className="text-clinic" />
            </div>
            <h3 className="text-base font-semibold text-heading mb-1">Provider Clinic</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Run assessments, calculate dosage, submit claims for authorization
            </p>
          </button>

          <button
            onClick={() => setRole('insurance', 'Claims Reviewer')}
            className="group card card-hover text-left !p-6
              hover:border-primary transition-all focus-ring"
          >
            <div className="w-11 h-11 rounded-lg bg-primary-light flex items-center justify-center mb-4">
              <Shield size={22} className="text-primary" />
            </div>
            <h3 className="text-base font-semibold text-heading mb-1">Insurance Payer</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Review claims, validate calculations, manage policy configurations
            </p>
          </button>
        </div>

        <p className="text-center text-placeholder text-xs mt-8">
          Demo Prototype — Select a role to begin
        </p>
      </div>
    </div>
  );
}
