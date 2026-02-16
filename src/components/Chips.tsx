interface ChipsProps {
  options: readonly string[] | string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  color?: string;
}

export function Chips({ options, selected, onChange, color = 'clinic' }: ChipsProps) {
  const activeClass = color === 'insurance'
    ? 'bg-primary-light border-primary text-primary'
    : 'bg-clinic-light border-clinic text-clinic';

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border-[1.5px] transition-all focus-ring
            ${selected.includes(opt)
              ? activeClass
              : 'bg-card border-border text-text-secondary hover:border-primary hover:text-primary'
            }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
