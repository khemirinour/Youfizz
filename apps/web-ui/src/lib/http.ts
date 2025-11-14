import axios, { AxiosError, AxiosInstance } from 'axios';
import { useAuthStore } from '../stores/authStore';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let httpInstance: AxiosInstance | null = null;
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value?: any) => void;
	reject: (error?: any) => void;
}> = [];

function getToken(): string | null {
	try {
		if (typeof window === 'undefined') return null;
		const tokenFromStorage = window.localStorage.getItem('token');
		return tokenFromStorage || null;
	} catch {
		return null;
	}
}

function processQueue(error: any, token: string | null = null) {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
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
			const originalRequest = error.config as any;
			const status = error.response?.status;
			const url = originalRequest?.url || '';

			// List of public endpoints that don't require auth
			const publicEndpoints = ['/api/orders'];
			const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint));

			// Handle 403 - Forbidden (token expired or invalid)
			if (status === 403 && originalRequest && !originalRequest._retry) {
				// Prevent infinite loop if refresh endpoint also returns 403
				if (originalRequest.url?.includes('/auth/refresh')) {
					try {
						useAuthStore.getState().logout();
					} catch {}
					if (typeof window !== 'undefined') {
						const currentPath = window.location.pathname;
						if (!currentPath.startsWith('/signin')) {
							window.location.assign('/signin');
						}
					}
					return Promise.reject(error);
				}

				// Don't redirect for public endpoints
				if (isPublicEndpoint) {
					return Promise.reject(error);
				}

				if (isRefreshing) {
					// If already refreshing, queue this request
					return new Promise((resolve, reject) => {
						failedQueue.push({ resolve, reject });
					})
						.then((token) => {
							if (originalRequest.headers) {
								originalRequest.headers.Authorization = `Bearer ${token}`;
							}
							return httpInstance!.request(originalRequest);
						})
						.catch((err) => {
							return Promise.reject(err);
						});
				}

				originalRequest._retry = true;
				isRefreshing = true;

				try {
					const refreshed = await useAuthStore.getState().refreshToken();
					
					if (refreshed) {
						const newToken = getToken();
						processQueue(null, newToken);
						
						// Update authorization header and retry original request
						if (originalRequest.headers && newToken) {
							originalRequest.headers.Authorization = `Bearer ${newToken}`;
						}
						
						return httpInstance!.request(originalRequest);
					} else {
						processQueue(error, null);
						throw error;
					}
				} catch (refreshError) {
					processQueue(refreshError, null);
					try {
						useAuthStore.getState().logout();
					} catch {}
					if (typeof window !== 'undefined') {
						const currentPath = window.location.pathname;
						if (!currentPath.startsWith('/signin')) {
							window.location.assign('/signin');
						}
					}
					return Promise.reject(refreshError);
				} finally {
					isRefreshing = false;
				}
			}

			// Handle 401 - Unauthorized (no token or invalid token)
			if (status === 401) {
				// Don't redirect for public endpoints - let the error propagate
				if (isPublicEndpoint) {
					return Promise.reject(error);
				}

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

export const patch = <T = unknown>(url: string, data?: unknown) =>
  http().patch<T>(url, data).then((r) => r.data);

export const del = <T = unknown>(url: string) =>
	http().delete<T>(url).then((r) => r.data);


