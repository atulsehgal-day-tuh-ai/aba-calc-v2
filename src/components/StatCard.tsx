interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
  color?: 'clinic' | 'insurance' | 'warn' | 'danger' | 'success';
}

const colorMap: Record<string, string> = {
  clinic: 'border-clinic/20 text-clinic',
  insurance: 'border-insur/20 text-insur',
  warn: 'border-warn/20 text-warn',
  danger: 'border-danger/20 text-danger',
  success: 'border-success/20 text-success',
};

export function StatCard({ label, value, sublabel, icon, color = 'clinic' }: StatCardProps) {
  return (
    <div className={`bg-card rounded-xl border ${colorMap[color].split(' ')[0]} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted uppercase tracking-wide">{label}</span>
        {icon && <span className={colorMap[color].split(' ')[1]}>{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${colorMap[color].split(' ')[1]}`}>{value}</div>
      {sublabel && <div className="text-xs text-dim mt-1">{sublabel}</div>}
    </div>
  );
}
