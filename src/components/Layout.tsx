import type { ReactNode } from 'react';
import { LogOut, Brain } from 'lucide-react';
import { useAuthStore } from '../stores/authStore.ts';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { role, userName, logout } = useAuthStore();

  const accentColor = role === 'insurance' ? 'text-insur' : 'text-clinic';
  const portalName = role === 'insurance' ? 'Insurance Portal' : 'Clinic Portal';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className={`${accentColor}`} size={24} />
          <div>
            <h1 className="text-base font-semibold text-text">
              ABA Medical Necessity Calculator
            </h1>
            <span className={`text-xs ${accentColor}`}>{portalName}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">{userName}</span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-danger transition"
          >
            <LogOut size={16} />
            Exit
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
