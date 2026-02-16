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
  const borderColor = color === 'insurance' ? 'border-insur/30' : 'border-clinic/30';
  const numColor = color === 'insurance' ? 'text-insur' : 'text-clinic';

  return (
    <div className={`bg-card rounded-xl border ${borderColor} overflow-hidden animate-fadeIn`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition"
      >
        <div className="flex items-center gap-3">
          {stepNumber !== undefined && (
            <span className={`text-xs font-bold ${numColor} bg-bg rounded-full w-6 h-6 flex items-center justify-center`}>
              {stepNumber}
            </span>
          )}
          <h3 className="text-base font-semibold text-text">{title}</h3>
          {badge}
        </div>
        {open ? (
          <ChevronUp size={18} className="text-muted" />
        ) : (
          <ChevronDown size={18} className="text-muted" />
        )}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}
