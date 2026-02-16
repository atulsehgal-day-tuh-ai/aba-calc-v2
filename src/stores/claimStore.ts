import { create } from 'zustand';
import { api } from '../lib/api.ts';

interface ClaimState {
  claims: any[];
  loading: boolean;
  error: string | null;
  fetchClaims: (role?: string) => Promise<void>;
  submitClaim: (data: any) => Promise<any>;
  updateStatus: (id: string, status: string, notes?: string) => Promise<void>;
}

export const useClaimStore = create<ClaimState>((set, get) => ({
  claims: [],
  loading: false,
  error: null,

  fetchClaims: async (role) => {
    set({ loading: true, error: null });
    try {
      const claims = await api.getClaims(role);
      set({ claims, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  submitClaim: async (data) => {
    set({ loading: true, error: null });
    try {
      const claim = await api.createClaim(data);
      set({ loading: false });
      return claim;
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  updateStatus: async (id, status, notes) => {
    try {
      await api.updateClaimStatus(id, status, notes);
      // Refresh claims
      await get().fetchClaims();
    } catch (e: any) {
      set({ error: e.message });
    }
  },
}));
