interface MeterProps {
  value: number;    // 0-100
  label?: string;
  color?: 'clinic' | 'insurance' | 'danger' | 'warn' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

const colorMap = {
  clinic: { bar: 'bg-clinic', glow: 'shadow-clinic-glow' },
  insurance: { bar: 'bg-insur', glow: 'shadow-insur-glow' },
  danger: { bar: 'bg-danger', glow: '' },
  warn: { bar: 'bg-warn', glow: '' },
  success: { bar: 'bg-success', glow: '' },
};

const sizeMap = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

export function Meter({ value, label, color = 'clinic', size = 'md' }: MeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const c = colorMap[color];

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-muted">{label}</span>
          <span className="text-xs font-medium text-text">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-border rounded-full ${sizeMap[size]} overflow-hidden`}>
        <div
          className={`${c.bar} ${sizeMap[size]} rounded-full transition-all duration-700 ease-out ${c.glow}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
