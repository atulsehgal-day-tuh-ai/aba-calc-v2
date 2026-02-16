interface MeterProps {
  value: number;    // 0-100
  label?: string;
  color?: 'clinic' | 'insurance' | 'danger' | 'warn' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

const barColors: Record<string, string> = {
  clinic:    'bg-secondary',
  insurance: 'bg-primary',
  danger:    'bg-critical',
  warn:      'bg-warning',
  success:   'bg-success',
};

const sizeMap = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

export function Meter({ value, label, color = 'clinic', size = 'md' }: MeterProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-medium text-text-secondary">{label}</span>
          <span className="text-xs font-semibold text-heading">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-[#E2E8F0] rounded-full ${sizeMap[size]} overflow-hidden`}>
        <div
          className={`${barColors[color]} ${sizeMap[size]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
