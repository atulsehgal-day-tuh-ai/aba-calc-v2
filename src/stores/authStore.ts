import { create } from 'zustand';

export type UserRole = 'clinic' | 'insurance' | null;

interface AuthState {
  role: UserRole;
  userName: string;
  setRole: (role: UserRole, userName?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  userName: '',
  setRole: (role, userName) =>
    set({
      role,
      userName: userName || (role === 'clinic' ? 'Dr. Sarah Chen' : 'Claims Reviewer'),
    }),
  logout: () => set({ role: null, userName: '' }),
}));
