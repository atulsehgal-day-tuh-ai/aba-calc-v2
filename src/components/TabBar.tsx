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
  const activeBorder = color === 'insurance' ? 'border-l-[3px] border-l-[#0B6FA4]' : 'border-l-[3px] border-l-[#00897B]';

  return (
    <>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all focus-ring
              ${isActive
                ? `bg-white/10 text-white ${activeBorder}`
                : 'text-[#CBD5E1] hover:bg-white/[0.05] hover:text-white border-l-[3px] border-l-transparent'
              }`}
          >
            {tab.icon}
            <span className="truncate">{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-auto text-[11px] bg-white/10 rounded-full px-2 py-0.5 tabular-nums">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}
