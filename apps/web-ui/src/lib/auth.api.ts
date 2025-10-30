import { post } from './http';

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
	role?: 'vendeur' | 'confirmateur' | 'admin';
}

export interface UserResponse {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	role: 'vendeur' | 'confirmateur' | 'admin';
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
	return post<AuthResponse>('/api/login', payload);
}

export async function apiRegister(payload: RegisterPayload) {
	return post<UserResponse>('/api/register', payload);
}

export async function apiLogout(refreshToken: string) {
	return post<{ message: string }>('/api/logout', { refreshToken });
}

export async function apiLogoutAll(userId: string) {
	return post<{ message: string }>('/api/logout-all', { userId });
}

// Password reset endpoints
export async function apiRequestPasswordReset(email: string) {
	return post<{ message: string }>('/api/password-reset/request', { email });
}

export async function apiConfirmPasswordReset(token: string) {
	return post<{ valid: boolean; message?: string }>('/api/password-reset/confirm', { token });
}

export async function apiResetPassword(token: string, newPassword: string) {
	return post<{ message: string }>('/api/password-reset/reset', { token, newPassword });
}


