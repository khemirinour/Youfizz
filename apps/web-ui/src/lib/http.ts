import axios, { AxiosError, AxiosInstance } from 'axios';
import { useAuthStore } from '../stores/authStore';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let httpInstance: AxiosInstance | null = null;

function getToken(): string | null {
	try {
		if (typeof window === 'undefined') return null;
		const tokenFromStorage = window.localStorage.getItem('token');
		return tokenFromStorage || null;
	} catch {
		return null;
	}
}

function createHttp(): AxiosInstance {
	const instance = axios.create({
		baseURL,
		withCredentials: true,
		headers: {
			'Content-Type': 'application/json',
		},
	});

	instance.interceptors.request.use((config) => {
		const token = getToken();
		if (token) {
			config.headers = config.headers ?? {};
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	});

	instance.interceptors.response.use(
		(response) => response,
		async (error: AxiosError) => {
			const status = error.response?.status;

			if (status === 401) {
				try {
					useAuthStore.getState().logout();
				} catch {}
				if (typeof window !== 'undefined') {
					const currentPath = window.location.pathname;
					if (!currentPath.startsWith('/signin')) {
						window.location.assign('/signin');
					}
				}
			}

			return Promise.reject(error);
		}
	);

	return instance;
}

export function http(): AxiosInstance {
	if (!httpInstance) {
		httpInstance = createHttp();
	}
	return httpInstance;
}

export const get = <T = unknown>(url: string, params?: Record<string, unknown>) =>
	http().get<T>(url, { params }).then((r) => r.data);

export const post = <T = unknown>(url: string, data?: unknown) =>
	http().post<T>(url, data).then((r) => r.data);

export const put = <T = unknown>(url: string, data?: unknown) =>
	http().put<T>(url, data).then((r) => r.data);

export const del = <T = unknown>(url: string) =>
	http().delete<T>(url).then((r) => r.data);


