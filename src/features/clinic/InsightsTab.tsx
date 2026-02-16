import { useEffect, useState } from 'react';
import { api } from '../../lib/api.ts';
import { StatCard } from '../../components/StatCard.tsx';
import { Meter } from '../../components/Meter.tsx';
import { TrendingUp, Clock, CheckCircle2, XCircle, BarChart3, Users, AlertTriangle } from 'lucide-react';

export function InsightsTab() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.getAnalytics()
      .then((data) => { if (!cancelled) setAnalytics(data); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load analytics'); });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="text-center py-12 animate-fadeIn">
        <div className="w-14 h-14 rounded-full bg-critical-light flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={24} className="text-critical" />
        </div>
        <p className="text-sm text-critical font-medium">{error}</p>
        <button onClick={() => { setError(null); setAnalytics(null); api.getAnalytics().then(setAnalytics).catch((e) => setError(e.message)); }}
          className="btn-secondary btn-sm mt-4">
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 w-full" />)}
        </div>
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
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
      <div className="card">
        <h3 className="text-sm font-semibold text-subheading mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-secondary" />
          Approval Rate
        </h3>
        <Meter value={approvalRate} label="Overall Approval Rate" color="clinic" size="lg" />
      </div>

      {/* Average Hours */}
      <div className="card">
        <h3 className="text-sm font-semibold text-subheading mb-4 flex items-center gap-2">
          <Users size={16} className="text-secondary" />
          Average Metrics
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">Avg Recommended Hours</div>
            <div className="text-2xl font-bold text-heading mt-1">{Number(analytics.avgHours)?.toFixed(1) || '—'}h</div>
          </div>
          <div>
            <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">Avg Age</div>
            <div className="text-2xl font-bold text-heading mt-1">{Number(analytics.avgAge)?.toFixed(1) || '—'}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">Most Common Tier</div>
            <div className="text-2xl font-bold text-heading mt-1">Tier {analytics.commonTier || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
