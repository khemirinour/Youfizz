import { get, post } from './http';

// Base path for auth service from gateway
const AUTH_BASE = '/api/auth';

export interface ConfermateurUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'confermateur';
  isActive: boolean;
}

export async function findConfermateurByEmail(email: string): Promise<ConfermateurUser> {
  return get<ConfermateurUser>(`${AUTH_BASE}/users/by-email/${encodeURIComponent(email)}`, { role: 'confermateur' });
}

export async function requestConfermateurAssignment(vendeurId: string, confermateurEmail: string): Promise<{ message: string }> {
  return post<{ message: string }>(`${AUTH_BASE}/vendeurs/${vendeurId}/request-confermateur`, {
    confermateurEmail,
  });
}

