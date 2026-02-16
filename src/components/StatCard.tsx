interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
  color?: 'clinic' | 'insurance' | 'warn' | 'danger' | 'success';
}

const accentMap: Record<string, string> = {
  clinic:    'stat-card-secondary',
  insurance: 'stat-card-primary',
  warn:      'stat-card-warning',
  danger:    'stat-card-danger',
  success:   'stat-card-success',
};

const iconColorMap: Record<string, string> = {
  clinic:    'text-secondary',
  insurance: 'text-primary',
  warn:      'text-warning',
  danger:    'text-critical',
  success:   'text-success',
};

export function StatCard({ label, value, sublabel, icon, color = 'clinic' }: StatCardProps) {
  return (
    <div className={`card ${accentMap[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</span>
        {icon && <span className={iconColorMap[color]}>{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-heading">{value}</div>
      {sublabel && <div className="text-xs text-text-secondary mt-1">{sublabel}</div>}
    </div>
  );
}
