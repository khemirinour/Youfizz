import { get } from './http';
import { useVendorConfermateurStore } from '@/stores/vendorConfermateurStore';

export interface ConfermateurVendeur {
  id: string;
  vendorId: string; // Add vendor entity ID
  email: string;
  firstName: string;
  lastName: string;
}

const AUTH_BASE = '/api/auth';

export async function getVendeursForConfermateur(
  confermateurUserId: string,
): Promise<ConfermateurVendeur[] | undefined> {
  // Get cached data from store
  const { getCachedVendeursForConfermateur, setCachedVendeursForConfermateur } = useVendorConfermateurStore.getState();
  const cachedData = getCachedVendeursForConfermateur(confermateurUserId);
  
  // Make API call
  const response = await get<ConfermateurVendeur[]>(
    `${AUTH_BASE}/confermateurs/${confermateurUserId}/vendeurs`,
  );
  
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
  setCachedVendeursForConfermateur(confermateurUserId, response);
  
  return response;
}


