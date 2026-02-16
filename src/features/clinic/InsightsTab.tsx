import { useEffect, useState } from 'react';
import { api } from '../../lib/api.ts';
import { StatCard } from '../../components/StatCard.tsx';
import { Meter } from '../../components/Meter.tsx';
import { TrendingUp, Clock, CheckCircle2, XCircle, BarChart3, Users } from 'lucide-react';

export function InsightsTab() {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    api.getAnalytics().then(setAnalytics).catch(() => {});
  }, []);

  if (!analytics) {
    return <div className="text-muted text-sm py-8 text-center">Loading analytics…</div>;
  }

  const approvalRate = analytics.total > 0
    ? Math.round((analytics.approved / analytics.total) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Claims" value={analytics.total} icon={<BarChart3 size={16} />} />
        <StatCard label="Approved" value={analytics.approved} color="success" icon={<CheckCircle2 size={16} />} />
        <StatCard label="Denied" value={analytics.denied} color="danger" icon={<XCircle size={16} />} />
        <StatCard label="Pending" value={analytics.pending} color="warn" icon={<Clock size={16} />} />
      </div>

      {/* Approval Rate */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-clinic" />
          Approval Rate
        </h3>
        <Meter value={approvalRate} label="Overall Approval Rate" color="clinic" size="lg" />
      </div>

      {/* Average Hours */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
          <Users size={16} className="text-clinic" />
          Average Metrics
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted">Avg Recommended Hours</div>
            <div className="text-xl font-bold text-text">{analytics.avgHours?.toFixed(1) || '—'}h</div>
          </div>
          <div>
            <div className="text-xs text-muted">Avg Age</div>
            <div className="text-xl font-bold text-text">{analytics.avgAge?.toFixed(1) || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Most Common Tier</div>
            <div className="text-xl font-bold text-text">Tier {analytics.commonTier || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
