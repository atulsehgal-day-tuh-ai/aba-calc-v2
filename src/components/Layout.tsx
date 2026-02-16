import type { ReactNode } from 'react';
import { LogOut, Brain } from 'lucide-react';
import { useAuthStore } from '../stores/authStore.ts';

interface LayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export function Layout({ children, sidebar }: LayoutProps) {
  const { role, userName, logout } = useAuthStore();

  const portalName = role === 'insurance' ? 'Insurance Portal' : 'Clinic Portal';
  const portalBadgeColor = role === 'insurance'
    ? 'bg-primary-light text-primary'
    : 'bg-clinic-light text-clinic';

  return (
    <div className="min-h-screen flex">
      {/* Sidebar — §7 */}
      <aside
        className="w-[260px] flex-shrink-0 flex flex-col text-white"
        style={{ background: 'linear-gradient(180deg, #1B2A4A, #162240)' }}
      >
        {/* Brand */}
        <div className="px-5 py-5 flex items-center gap-3 border-b border-white/[0.08]">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white leading-tight truncate">ABA Calculator</div>
            <span className={`inline-block mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${portalBadgeColor}`}>
              {portalName}
            </span>
          </div>
        </div>

        {/* Navigation Items (from portal) */}
        <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
          {sidebar}
        </nav>

        {/* User / Logout */}
        <div className="px-4 py-4 border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white/80">
                {userName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white/90 truncate">{userName}</div>
                <div className="text-[11px] text-white/50 capitalize">{role}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition focus-ring"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Frosted top bar — §10.1 */}
        <header className="sticky top-0 z-10 frosted border-b border-border px-8 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-heading">ABA Medical Necessity Calculator</h1>
        </header>

        <main className="flex-1 px-8 py-6 max-w-[1200px] w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
