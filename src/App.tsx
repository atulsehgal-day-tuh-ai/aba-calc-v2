import { useAuthStore } from './stores/authStore.ts';
import { LoginScreen } from './features/auth/LoginScreen.tsx';
import { ClinicPortal } from './features/clinic/ClinicPortal.tsx';
import { InsurancePortal } from './features/insurance/InsurancePortal.tsx';

export default function App() {
  const role = useAuthStore((s) => s.role);

  if (!role) return <LoginScreen />;
  if (role === 'clinic') return <ClinicPortal />;
  if (role === 'insurance') return <InsurancePortal />;

  return null;
}
