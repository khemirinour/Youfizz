import { get } from './http';

export interface ConfermateurVendeur {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const AUTH_BASE = '/api/auth';

export async function getVendeursForConfermateur(
  confermateurUserId: string,
): Promise<ConfermateurVendeur[]> {
  return get<ConfermateurVendeur[]>(
    `${AUTH_BASE}/confermateurs/${confermateurUserId}/vendeurs`,
  );
}


