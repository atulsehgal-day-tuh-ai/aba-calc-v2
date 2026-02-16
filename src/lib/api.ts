// ============================================================================
// API Client — Thin wrapper around fetch for the backend
// ============================================================================

const BASE = '/api';

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers as Record<string,string> },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// --- Claims ---
export const api = {
  // Claims
  getClaims: (role?: string) =>
    request<any[]>(`/claims${role ? `?role=${role}` : ''}`),
  getClaim: (id: string) =>
    request<any>(`/claims/${id}`),
  createClaim: (data: any) =>
    request<any>('/claims', { method: 'POST', body: JSON.stringify(data) }),
  updateClaimStatus: (id: string, status: string, notes?: string) =>
    request<any>(`/claims/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),

  // Patients
  getPatients: () => request<any[]>('/patients'),
  getPatient: (id: string) => request<any>(`/patients/${id}`),
  createPatient: (data: any) =>
    request<any>('/patients', { method: 'POST', body: JSON.stringify(data) }),

  // Analytics
  getAnalytics: () => request<any>('/analytics'),

  // Payer Profiles
  getPayerProfiles: () => request<any[]>('/payer-profiles'),
  getPayerProfile: (id: string) => request<any>(`/payer-profiles/${id}`),
  updatePayerProfile: (id: string, data: any) =>
    request<any>(`/payer-profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
