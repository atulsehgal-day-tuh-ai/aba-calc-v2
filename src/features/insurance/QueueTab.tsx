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
    return <div className="text-muted text-sm py-8 text-center">Loading queue…</div>;
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
        <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
          <Clock size={16} className="text-insur" />
          Pending Review ({pendingClaims.length})
        </h3>
        {pendingClaims.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <CheckCircle2 size={32} className="text-dim mx-auto mb-2" />
            <p className="text-sm text-muted">Queue is clear — no pending claims</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingClaims.map((claim: any) => {
              const isExpanded = expanded === claim.id;
              const calcResult = claim.calc_result ? JSON.parse(claim.calc_result) : null;
              const mlPrediction = claim.ml_prediction ? JSON.parse(claim.ml_prediction) : null;
              const status = statusConfig[claim.status] || statusConfig.submitted;

              return (
                <div key={claim.id} className="bg-card rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : claim.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-insur-soft flex items-center justify-center">
                        <FileText size={18} className="text-insur" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-text">{claim.patient_name || 'Patient'}</div>
                        <div className="text-xs text-muted">
                          Age {claim.age} · {claim.diagnosis} · {calcResult?.final || '?'}h/wk requested
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {mlPrediction && (
                        <span className={`text-xs font-medium ${mlPrediction.tier === 'likely-approve' ? 'text-success' :
                          mlPrediction.tier === 'borderline' ? 'text-warn' : 'text-danger'}`}>
                          {mlPrediction.probability}% est.
                        </span>
                      )}
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <ChevronRight size={16} className={`text-muted transition ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border pt-4 space-y-4 animate-fadeIn">
                      {/* Calculation breakdown */}
                      {calcResult && (
                        <div className="grid grid-cols-4 gap-3">
                          <div className="bg-bg rounded-lg p-3">
                            <div className="text-xs text-muted">FII Score</div>
                            <div className="text-lg font-bold text-text">{calcResult.fii}/36</div>
                          </div>
                          <div className="bg-bg rounded-lg p-3">
                            <div className="text-xs text-muted">Base Hours</div>
                            <div className="text-lg font-bold text-text">{calcResult.base}h</div>
                          </div>
                          <div className="bg-bg rounded-lg p-3">
                            <div className="text-xs text-muted">Final Hours</div>
                            <div className="text-lg font-bold text-insur">{calcResult.final}h</div>
                          </div>
                          <div className="bg-bg rounded-lg p-3">
                            <div className="text-xs text-muted">Tier</div>
                            <div className="text-lg font-bold text-text">{calcResult.tier}</div>
                          </div>
                        </div>
                      )}

                      {/* Rationale */}
                      {calcResult?.rationale && (
                        <div className="bg-bg rounded-lg p-3">
                          <div className="text-xs font-semibold text-muted mb-2">Calculation Rationale</div>
                          {calcResult.rationale.map((r: string, i: number) => (
                            <div key={i} className="text-xs text-muted py-0.5">› {r}</div>
                          ))}
                        </div>
                      )}

                      {/* Flags */}
                      {calcResult?.flags?.length > 0 && (
                        <div className="bg-danger-soft rounded-lg p-3">
                          <div className="text-xs font-semibold text-danger mb-1 flex items-center gap-1">
                            <AlertTriangle size={12} /> Clinical Flags
                          </div>
                          {calcResult.flags.map((f: string, i: number) => (
                            <div key={i} className="text-xs text-danger/80">• {f}</div>
                          ))}
                        </div>
                      )}

                      {/* Review Notes + Actions */}
                      <div>
                        <textarea
                          placeholder="Add review notes (optional)…"
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-dim
                            focus:border-border-focus focus:outline-none resize-none h-20"
                        />
                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => handleDecision(claim.id, 'approved')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-success/20 text-success rounded-lg text-sm font-medium hover:bg-success/30 transition"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleDecision(claim.id, 'denied')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-danger/20 text-danger rounded-lg text-sm font-medium hover:bg-danger/30 transition"
                          >
                            <XCircle size={14} /> Deny
                          </button>
                          <button
                            onClick={() => handleDecision(claim.id, 'info_requested')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-insur/20 text-insur rounded-lg text-sm font-medium hover:bg-insur/30 transition"
                          >
                            <MessageSquare size={14} /> Request Info
                          </button>
                          <button
                            onClick={() => handleDecision(claim.id, 'under_review')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-warn/20 text-warn rounded-lg text-sm font-medium hover:bg-warn/30 transition"
                          >
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
          <h3 className="text-sm font-semibold text-text mb-3">
            Resolved ({resolvedClaims.length})
          </h3>
          <div className="space-y-2">
            {resolvedClaims.map((claim: any) => {
              const status = statusConfig[claim.status] || statusConfig.submitted;
              const calcResult = claim.calc_result ? JSON.parse(claim.calc_result) : null;
              return (
                <div key={claim.id} className="bg-card rounded-xl border border-border p-3 flex items-center justify-between opacity-70">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-text">{claim.patient_name || 'Patient'}</span>
                    <span className="text-xs text-muted">Age {claim.age} · {calcResult?.final || '?'}h/wk</span>
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
