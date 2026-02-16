interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabBarProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
  color?: 'clinic' | 'insurance';
}

export function TabBar({ tabs, active, onChange, color = 'clinic' }: TabBarProps) {
  const activeColor = color === 'insurance'
    ? 'border-insur text-insur'
    : 'border-clinic text-clinic';

  return (
    <div className="flex gap-1 border-b border-border mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
            ${active === tab.key
              ? activeColor
              : 'border-transparent text-muted hover:text-text'
            }`}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1 text-xs bg-border rounded-full px-2 py-0.5">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
