import { get, post, del } from './http';
import { useVendorConfermateurStore } from '@/stores/vendorConfermateurStore';

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
): Promise<ConfermateurUser[] | undefined> {
  // Get cached data from store
  const { getCachedConfermateursForVendeur, setCachedConfermateursForVendeur } = useVendorConfermateurStore.getState();
  const cachedData = getCachedConfermateursForVendeur(vendeurUserId);
  
  // Make API call
  const response = await get<ConfermateurUser[]>(`${AUTH_BASE}/vendeurs/${vendeurUserId}/confermateurs`);
  
  // If response is undefined (304 Not Modified), return cached data from store
  if (!response) {
    if (cachedData) {
      return cachedData;
    }
    return undefined;
  }
  
  // Empty array might indicate a 304 - return cached data if available
  if (response.length === 0 && cachedData) {
    return cachedData;
  }
  
  // Update cache with new data
  setCachedConfermateursForVendeur(vendeurUserId, response);
  
  return response;
}

export async function removeConfermateurForVendeur(
  vendeurUserId: string,
  confermateurUserId: string,
): Promise<{ message: string }> {
  return del<{ message: string }>(
    `${AUTH_BASE}/vendeurs/${vendeurUserId}/confermateurs/${confermateurUserId}`,
  );
}

export interface VendorConfirmQuota {
  vendorId: string;
  remaining: number;
}

export async function getVendorConfirmQuota(vendorId: string): Promise<VendorConfirmQuota | undefined> {
  const response = await get<{ vendorId: string; remaining: number }>(
    `${AUTH_BASE}/internal/vendors/confirm-quota`,
    { vendorId },
  );
  
  if (!response) {
    return undefined;
  }
  
  return response;
}

