import { post } from './http';
import { http } from './http';

// DTOs based on backend contracts
export interface LoginPayload {
	email: string;
	password: string;
}

export interface RegisterPayload {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
	role?: 'vendeur' | 'confermateur' | 'admin';
}

export interface UserResponse {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	role: 'vendeur' | 'confermateur' | 'admin';
}

export interface AuthResponse {
	user: UserResponse;
	accessToken: string;
	refreshToken: string;
	tokenType: string; // 'Bearer'
	expiresIn: number; // seconds
	vendorId?: string;
	confirmateurId?: string;
}

export async function apiLogin(payload: LoginPayload) {
	return post<AuthResponse>('/api/auth/login', payload);
}

export async function apiRegister(payload: RegisterPayload) {
	return post<UserResponse>('/api/auth/register', payload);
}

export async function apiLogout(refreshToken: string) {
	return post<{ message: string }>('/api/auth/logout', { refreshToken });
}

export async function apiLogoutAll(userId: string) {
	return post<{ message: string }>('/api/auth/logout-all', { userId });
}

export interface RefreshTokenPayload {
	refreshToken: string;
}

export async function apiRefreshToken(refreshToken: string) {
	// Use http() helper to go through gateway
	// Refresh endpoint doesn't require Authorization header
	const response = await http().post<AuthResponse>(
		'/api/auth/refresh',
		{ refreshToken },
	);
	return response.data;
}

// Password reset endpoints
export async function apiRequestPasswordReset(email: string) {
	return post<{ message: string }>('/api/auth/password-reset/request', { email });
}

export async function apiConfirmPasswordReset(token: string) {
	return post<{ valid: boolean; message?: string }>('/api/auth/password-reset/confirm', { token });
}

export async function apiResetPassword(token: string, newPassword: string) {
	return post<{ message: string }>('/api/auth/password-reset/reset', { token, newPassword });
}


