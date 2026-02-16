import { useEffect, useState } from 'react';
import { useClaimStore } from '../../stores/claimStore.ts';
import { Badge } from '../../components/Badge.tsx';
import { StatCard } from '../../components/StatCard.tsx';
import {
  Inbox, Clock, CheckCircle2, XCircle, AlertTriangle, FileText, MessageSquare, ChevronRight
} from 'lucide-react';

const statusConfig: Record<string, { variant: any; label: string }> = {
  submitted: { variant: 'info', label: 'New' },
  under_review: { variant: 'warn', label: 'Reviewing' },
  approved: { variant: 'success', label: 'Approved' },
  denied: { variant: 'danger', label: 'Denied' },
  info_requested: { variant: 'purple', label: 'Info Requested' },
};

export function QueueTab() {
  const { claims, loading, fetchClaims, updateStatus } = useClaimStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchClaims('insurance');
  }, [fetchClaims]);

  const pendingClaims = claims.filter((c: any) => c.status !== 'approved' && c.status !== 'denied');
  const resolvedClaims = claims.filter((c: any) => c.status === 'approved' || c.status === 'denied');

  const handleDecision = async (claimId: string, decision: string) => {
    await updateStatus(claimId, decision, reviewNotes);
    setExpanded(null);
    setReviewNotes('');
    fetchClaims('insurance');
  };

  if (loading && claims.length === 0) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 w-full" />)}
        </div>
        {[1,2,3].map(i => <div key={i} className="skeleton h-20 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="In Queue" value={pendingClaims.length} icon={<Inbox size={16} />} color="insurance" />
        <StatCard label="Approved" value={resolvedClaims.filter((c: any) => c.status === 'approved').length} icon={<CheckCircle2 size={16} />} color="success" />
        <StatCard label="Denied" value={resolvedClaims.filter((c: any) => c.status === 'denied').length} icon={<XCircle size={16} />} color="danger" />
        <StatCard label="Total" value={claims.length} icon={<FileText size={16} />} color="insurance" />
      </div>

      {/* Pending Claims */}
      <div>
        <h3 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
          <Clock size={16} className="text-primary" />
          Pending Review ({pendingClaims.length})
        </h3>
        {pendingClaims.length === 0 ? (
          <div className="card text-center !py-10">
            <div className="w-14 h-14 rounded-full bg-success-light flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} className="text-success" />
            </div>
            <p className="text-sm text-body font-medium">Queue is clear</p>
            <p className="text-xs text-text-secondary mt-1">No pending claims to review</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingClaims.map((claim: any) => {
              const isExpanded = expanded === claim.id;
              const calcResult = claim.calc_result ? JSON.parse(claim.calc_result) : null;
              const mlPrediction = claim.ml_prediction ? JSON.parse(claim.ml_prediction) : null;
              const status = statusConfig[claim.status] || statusConfig.submitted;

              return (
                <div key={claim.id} className="card !p-0 overflow-hidden">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : claim.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-hover transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                        <FileText size={18} className="text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-heading">{claim.patient_name || 'Patient'}</div>
                        <div className="text-xs text-text-secondary">
                          Age {claim.age} · {claim.diagnosis} · {calcResult?.final || '?'}h/wk requested
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {mlPrediction && (
                        <span className={`text-xs font-semibold ${mlPrediction.tier === 'likely-approve' ? 'text-success' :
                          mlPrediction.tier === 'borderline' ? 'text-warning' : 'text-critical'}`}>
                          {mlPrediction.probability}% est.
                        </span>
                      )}
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <ChevronRight size={16} className={`text-text-secondary transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-border pt-4 space-y-4 animate-slideDown">
                      {/* Calculation breakdown */}
                      {calcResult && (
                        <div className="grid grid-cols-4 gap-3">
                          <div className="bg-[#F7FAFC] rounded-lg p-3 border border-border">
                            <div className="text-xs text-text-secondary uppercase tracking-wide">FII Score</div>
                            <div className="text-lg font-bold text-heading">{calcResult.fii}/36</div>
                          </div>
                          <div className="bg-[#F7FAFC] rounded-lg p-3 border border-border">
                            <div className="text-xs text-text-secondary uppercase tracking-wide">Base Hours</div>
                            <div className="text-lg font-bold text-heading">{calcResult.base}h</div>
                          </div>
                          <div className="bg-[#F7FAFC] rounded-lg p-3 border border-border">
                            <div className="text-xs text-text-secondary uppercase tracking-wide">Final Hours</div>
                            <div className="text-lg font-bold text-primary">{calcResult.final}h</div>
                          </div>
                          <div className="bg-[#F7FAFC] rounded-lg p-3 border border-border">
                            <div className="text-xs text-text-secondary uppercase tracking-wide">Tier</div>
                            <div className="text-lg font-bold text-heading">{calcResult.tier}</div>
                          </div>
                        </div>
                      )}

                      {/* Rationale */}
                      {calcResult?.rationale && (
                        <div className="bg-[#F7FAFC] rounded-lg p-4 border border-border">
                          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Calculation Rationale</div>
                          {calcResult.rationale.map((r: string, i: number) => (
                            <div key={i} className="text-xs text-body py-0.5 flex items-start gap-2">
                              <span className="text-primary font-bold">›</span> {r}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Flags */}
                      {calcResult?.flags?.length > 0 && (
                        <div className="bg-critical-light rounded-lg p-4 border border-critical/20">
                          <div className="text-xs font-semibold text-critical mb-1 flex items-center gap-1">
                            <AlertTriangle size={12} /> Clinical Flags
                          </div>
                          {calcResult.flags.map((f: string, i: number) => (
                            <div key={i} className="text-xs text-critical/80">• {f}</div>
                          ))}
                        </div>
                      )}

                      {/* Review Notes + Actions */}
                      <div>
                        <textarea
                          placeholder="Add review notes (optional)…"
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          className="w-full bg-card border-[1.5px] border-border-input rounded-lg px-3 py-2.5 text-sm text-body placeholder:text-placeholder
                            focus:border-border-focus focus:outline-none focus:shadow-[0_0_0_3px_rgba(11,111,164,0.15)] resize-none h-20 transition-all"
                        />
                        <div className="flex gap-3 mt-3">
                          <button onClick={() => handleDecision(claim.id, 'approved')} className="btn-success btn-sm">
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button onClick={() => handleDecision(claim.id, 'denied')} className="btn-danger btn-sm">
                            <XCircle size={14} /> Deny
                          </button>
                          <button onClick={() => handleDecision(claim.id, 'info_requested')} className="btn-secondary btn-sm">
                            <MessageSquare size={14} /> Request Info
                          </button>
                          <button onClick={() => handleDecision(claim.id, 'under_review')} className="btn-warn btn-sm">
                            <Clock size={14} /> Mark Reviewing
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved */}
      {resolvedClaims.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-heading mb-3">
            Resolved ({resolvedClaims.length})
          </h3>
          <div className="space-y-2">
            {resolvedClaims.map((claim: any) => {
              const status = statusConfig[claim.status] || statusConfig.submitted;
              const calcResult = claim.calc_result ? JSON.parse(claim.calc_result) : null;
              return (
                <div key={claim.id} className="card !p-3 flex items-center justify-between opacity-75">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-heading font-medium">{claim.patient_name || 'Patient'}</span>
                    <span className="text-xs text-text-secondary">Age {claim.age} · {calcResult?.final || '?'}h/wk</span>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
