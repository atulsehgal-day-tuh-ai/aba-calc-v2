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
  const activeColorMap: Record<string, string> = {
    clinic: 'bg-secondary text-white',
    insurance: 'bg-primary text-white',
  };
  const activeClass = activeColorMap[color] || 'bg-secondary text-white';

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-body w-48 flex-shrink-0">{label}</span>
      <div className="flex gap-1.5">
        {Array.from({ length: max + 1 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all focus-ring
              ${value === i
                ? activeClass
                : 'bg-card border-[1.5px] border-border-input text-text-secondary hover:border-primary hover:text-primary'
              }`}
          >
            {i}
          </button>
        ))}
      </div>
      {descriptions && descriptions[value] && (
        <span className="text-xs text-text-secondary ml-2 italic">{descriptions[value]}</span>
      )}
    </div>
  );
}
