import { get, post, del } from './http';

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
  return get<ConfermateurUser>(`${AUTH_BASE}/users/by-email/${encodeURIComponent(email)}`, {
    role: 'confermateur',
  });
}

export async function requestConfermateurAssignment(
  vendeurId: string,
  confermateurEmail: string,
): Promise<{ message: string }> {
  return post<{ message: string }>(`${AUTH_BASE}/vendeurs/${vendeurId}/request-confermateur`, {
    confermateurEmail,
  });
}

export async function getConfermateursForVendeur(
  vendeurUserId: string,
): Promise<ConfermateurUser[]> {
  return get<ConfermateurUser[]>(`${AUTH_BASE}/vendeurs/${vendeurUserId}/confermateurs`);
}

export async function removeConfermateurForVendeur(
  vendeurUserId: string,
  confermateurUserId: string,
): Promise<{ message: string }> {
  return del<{ message: string }>(
    `${AUTH_BASE}/vendeurs/${vendeurUserId}/confermateurs/${confermateurUserId}`,
  );
}

