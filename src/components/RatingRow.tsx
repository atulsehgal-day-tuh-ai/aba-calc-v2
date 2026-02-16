interface RatingRowProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  max?: number;
  descriptions?: string[];
  color?: string;
}

export function RatingRow({
  label,
  value,
  onChange,
  max = 4,
  descriptions,
  color = 'clinic',
}: RatingRowProps) {
  const colorMap: Record<string, string> = {
    clinic: 'bg-clinic',
    insurance: 'bg-insur',
  };
  const activeClass = colorMap[color] || 'bg-clinic';

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-text w-48 flex-shrink-0">{label}</span>
      <div className="flex gap-1">
        {Array.from({ length: max + 1 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`w-8 h-8 rounded text-xs font-medium transition-all
              ${value === i
                ? `${activeClass} text-bg`
                : 'bg-bg border border-border text-muted hover:border-border-focus'
              }`}
          >
            {i}
          </button>
        ))}
      </div>
      {descriptions && descriptions[value] && (
        <span className="text-xs text-dim ml-2">{descriptions[value]}</span>
      )}
    </div>
  );
}
