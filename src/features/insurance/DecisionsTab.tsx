import { useEffect } from 'react';
import { useClaimStore } from '../../stores/claimStore.ts';
import { Badge } from '../../components/Badge.tsx';
import { StatCard } from '../../components/StatCard.tsx';
import { CheckCircle2, XCircle, BarChart3, TrendingUp } from 'lucide-react';

export function DecisionsTab() {
  const { claims, fetchClaims } = useClaimStore();

  useEffect(() => {
    fetchClaims('insurance');
  }, [fetchClaims]);

  const approved = claims.filter((c: any) => c.status === 'approved');
  const denied = claims.filter((c: any) => c.status === 'denied');
  const total = approved.length + denied.length;
  const approvalRate = total > 0 ? Math.round((approved.length / total) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Decisions" value={total} icon={<BarChart3 size={16} />} color="insurance" />
        <StatCard label="Approved" value={approved.length} icon={<CheckCircle2 size={16} />} color="success" />
        <StatCard label="Denied" value={denied.length} icon={<XCircle size={16} />} color="danger" />
        <StatCard label="Approval Rate" value={`${approvalRate}%`} icon={<TrendingUp size={16} />} color="insurance" />
      </div>

      {/* Decision History */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text">Decision History</h3>
        </div>
        {total === 0 ? (
          <div className="p-8 text-center text-muted text-sm">No decisions made yet</div>
        ) : (
          <div className="divide-y divide-border">
            {[...approved, ...denied].map((claim: any) => {
              const calcResult = claim.calc_result ? JSON.parse(claim.calc_result) : null;
              return (
                <div key={claim.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-sm font-medium text-text">{claim.patient_name || 'Patient'}</div>
                      <div className="text-xs text-muted">
                        Age {claim.age} · {calcResult?.final || '?'}h/wk · Tier {calcResult?.tier || '?'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {claim.review_notes && (
                      <span className="text-xs text-dim max-w-[200px] truncate">{claim.review_notes}</span>
                    )}
                    <Badge variant={claim.status === 'approved' ? 'success' : 'danger'}>
                      {claim.status === 'approved' ? 'Approved' : 'Denied'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
