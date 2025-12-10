import { get } from './http';
import { patch } from './http';
import { getUser } from './admin.api';

export interface ProfileResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'vendeur' | 'confermateur' | 'admin';
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
}

/**
 * Fetch the current user's profile using auth service
 * Uses the user's ID from auth store to get their data
 */
export async function getProfile(userId: string): Promise<ProfileResponse> {
  // Use auth service endpoint to get user by ID
  const user = await getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }
  // Filter out 'guest' role - only return valid roles
  const validRole = (user.role === 'vendeur' || user.role === 'confermateur' || user.role === 'admin') 
    ? user.role 
    : 'vendeur' as 'vendeur' | 'confermateur' | 'admin';
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: validRole,
    isActive: user.isActive,
  };
}

/**
 * Update the current user's profile using auth service PATCH endpoint
 */
export async function updateProfile(userId: string, data: UpdateProfilePayload): Promise<ProfileResponse> {
  // Use auth service PATCH endpoint instead of user service
  return patch<ProfileResponse>(`/api/auth/users/${userId}`, data);
}
