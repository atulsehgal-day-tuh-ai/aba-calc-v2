interface ChipsProps {
  options: readonly string[] | string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  color?: string;
}

export function Chips({ options, selected, onChange, color = 'clinic' }: ChipsProps) {
  const activeClass = color === 'insurance'
    ? 'bg-insur-soft border-insur/40 text-insur'
    : 'bg-clinic-soft border-clinic/40 text-clinic';

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
          className={`px-3 py-1.5 rounded-lg text-sm border transition-all
            ${selected.includes(opt)
              ? activeClass
              : 'bg-bg border-border text-muted hover:border-border-focus'
            }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
