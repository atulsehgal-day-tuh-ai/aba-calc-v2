import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface SectionProps {
  title: string;
  stepNumber?: number;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
  color?: string;
}

export function Section({
  title,
  stepNumber,
  children,
  defaultOpen = true,
  badge,
  color = 'clinic',
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const accentColor = color === 'insurance' ? 'text-primary' : 'text-secondary';

  return (
    <div className="card animate-fadeIn !p-0 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-hover transition focus-ring rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          {stepNumber !== undefined && (
            <span className={`text-xs font-bold ${accentColor} bg-[#F0F4F8] rounded-full w-7 h-7 flex items-center justify-center`}>
              {stepNumber}
            </span>
          )}
          <h3 className="text-base font-semibold text-subheading">{title}</h3>
          {badge}
        </div>
        {open ? (
          <ChevronUp size={18} className="text-text-secondary" />
        ) : (
          <ChevronDown size={18} className="text-text-secondary" />
        )}
      </button>
      {open && <div className="px-6 pb-6 animate-slideDown">{children}</div>}
    </div>
  );
}
