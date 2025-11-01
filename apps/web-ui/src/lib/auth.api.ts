import { post } from './http';
import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

export interface RefreshTokenPayload {
	refreshToken: string;
}

export async function apiRefreshToken(refreshToken: string) {
	// Use axios directly without interceptor to avoid circular dependency
	// Refresh endpoint doesn't require Authorization header
	const response = await axios.post<AuthResponse>(
		`${baseURL}/api/auth/refresh`,
		{ refreshToken },
		{
			withCredentials: true,
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
	return response.data;
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


