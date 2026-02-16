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
      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-table-header">
          <h3 className="text-sm font-semibold text-heading">Decision History</h3>
        </div>
        {total === 0 ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-[#F0F4F8] flex items-center justify-center mx-auto mb-3">
              <BarChart3 size={24} className="text-disabled" />
            </div>
            <p className="text-sm text-body font-medium">No decisions made yet</p>
            <p className="text-xs text-text-secondary mt-1">Decisions will appear here once claims are reviewed</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {[...approved, ...denied].map((claim: any) => {
              const calcResult = claim.calc_result ? JSON.parse(claim.calc_result) : null;
              return (
                <div key={claim.id} className="px-6 py-4 flex items-center justify-between hover:bg-hover transition">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-sm font-medium text-heading">{claim.patient_name || 'Patient'}</div>
                      <div className="text-xs text-text-secondary">
                        Age {claim.age} · {calcResult?.final || '?'}h/wk · Tier {calcResult?.tier || '?'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {claim.review_notes && (
                      <span className="text-xs text-text-secondary max-w-[200px] truncate italic">{claim.review_notes}</span>
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
