import { useEffect } from 'react';
import { useClaimStore } from '../../stores/claimStore.ts';
import { Badge } from '../../components/Badge.tsx';
import { FileText, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const statusConfig: Record<string, { variant: any; icon: React.ReactNode; label: string }> = {
  submitted: { variant: 'info', icon: <Clock size={14} />, label: 'Submitted' },
  under_review: { variant: 'warn', icon: <AlertTriangle size={14} />, label: 'Under Review' },
  approved: { variant: 'success', icon: <CheckCircle2 size={14} />, label: 'Approved' },
  denied: { variant: 'danger', icon: <XCircle size={14} />, label: 'Denied' },
  info_requested: { variant: 'purple', icon: <FileText size={14} />, label: 'Info Requested' },
};

export function ClaimsTab() {
  const { claims, loading, fetchClaims } = useClaimStore();

  useEffect(() => {
    fetchClaims('clinic');
  }, [fetchClaims]);

  if (loading && claims.length === 0) {
    return <div className="text-muted text-sm py-8 text-center">Loading claims…</div>;
  }

  if (claims.length === 0) {
    return (
      <div className="text-center py-16 animate-fadeIn">
        <FileText size={40} className="text-dim mx-auto mb-3" />
        <p className="text-muted text-sm">No claims submitted yet</p>
        <p className="text-dim text-xs mt-1">Submit an assessment from the Calculator tab to create a claim</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fadeIn">
      <div className="text-sm text-muted mb-4">{claims.length} claim(s)</div>
      {claims.map((claim: any) => {
        const status = statusConfig[claim.status] || statusConfig.submitted;
        const calcResult = claim.calc_result ? JSON.parse(claim.calc_result) : null;
        return (
          <div key={claim.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between hover:border-border-focus/30 transition">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-clinic-soft flex items-center justify-center">
                <FileText size={18} className="text-clinic" />
              </div>
              <div>
                <div className="text-sm font-medium text-text">{claim.patient_name || 'Patient'}</div>
                <div className="text-xs text-muted">
                  ID: {claim.patient_id} · Age {claim.age} · {claim.diagnosis}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {calcResult && (
                <div className="text-right">
                  <div className="text-lg font-bold text-clinic">{calcResult.final}h/wk</div>
                  <div className="text-xs text-muted">Tier {calcResult.tier}</div>
                </div>
              )}
              <Badge variant={status.variant}>
                <span className="flex items-center gap-1">{status.icon} {status.label}</span>
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
