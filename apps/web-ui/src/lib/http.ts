import axios, { AxiosError, AxiosInstance } from 'axios';
import { useAuthStore } from '../stores/authStore';

// Get API URL from environment variable
// In production, NEXT_PUBLIC_API_URL must be set
// In development, fallback to localhost for convenience
const getBaseURL = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    return apiUrl;
  }
  
  // Development fallback only
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // Production: throw error if not configured
  throw new Error(
    'NEXT_PUBLIC_API_URL environment variable is required in production. ' +
    'Please set it to your API Gateway URL (e.g., https://api.youfizz.com)'
  );
};

const baseURL = getBaseURL();

let httpInstance: AxiosInstance | null = null;
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value?: any) => void;
	reject: (error?: any) => void;
}> = [];

// Tokens are now stored in HttpOnly cookies, not accessible via JavaScript
// Browser automatically sends cookies with requests when withCredentials: true
function getToken(): string | null {
	// Return null - tokens are in HttpOnly cookies, not accessible from JS
	return null;
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
		// Tokens are in HttpOnly cookies, browser sends them automatically
		// No need to set Authorization header - backend reads from cookies
		// Keep withCredentials: true to ensure cookies are sent
		
		// Don't override Content-Type for FormData - let browser set it with boundary
		if (config.data instanceof FormData) {
			delete config.headers['Content-Type'];
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
			// Auth endpoints (login, register) should not trigger token refresh on 401
			const publicEndpoints: string[] = []; // No public endpoints - all require auth except auth endpoints
			const authEndpoints = ['/api/auth/login', '/api/auth/register', '/api/auth/password-reset'];
			const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint));
			const isAuthEndpoint = authEndpoints.some(endpoint => url.includes(endpoint));

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
						// Token refresh successful, new tokens are in cookies
						// No need to update headers - cookies are sent automatically
						processQueue(null, null);
						
						// Retry original request (cookies will be sent automatically)
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
			if (status === 401 && originalRequest && !originalRequest._retry) {
				// Don't redirect for public endpoints - let the error propagate
				if (isPublicEndpoint) {
					return Promise.reject(error);
				}

				// Don't try to refresh token for auth endpoints (login, register, password-reset)
				// These endpoints return 401 for invalid credentials, not expired tokens
				if (isAuthEndpoint) {
					return Promise.reject(error);
				}

				// Prevent infinite loop if refresh endpoint also returns 401
				if (originalRequest.url?.includes('/auth/refresh')) {
					console.warn('Refresh token endpoint returned 401, logging out');
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

				// If already refreshing, queue this request
				if (isRefreshing) {
					console.log(`Token refresh in progress, queueing request: ${originalRequest.url}`);
					return new Promise((resolve, reject) => {
						failedQueue.push({ resolve, reject });
					})
						.then(() => {
							// Retry original request (cookies will be sent automatically)
							console.log(`Retrying queued request: ${originalRequest.url}`);
							return httpInstance!.request(originalRequest);
						})
						.catch((err) => {
							return Promise.reject(err);
						});
				}

				// Try to refresh token before logging out
				console.log(`401 error on ${originalRequest.url}, attempting token refresh`);
				originalRequest._retry = true;
				isRefreshing = true;

				try {
					const refreshed = await useAuthStore.getState().refreshToken();
					
					if (refreshed) {
						// Token refresh successful, new tokens are in cookies
						// No need to update headers - cookies are sent automatically
						console.log('Token refresh successful, retrying original request');
						processQueue(null, null);
						
						// Retry original request (cookies will be sent automatically)
						return httpInstance!.request(originalRequest);
					} else {
						// Refresh failed, logout
						console.warn('Token refresh failed, logging out');
						processQueue(error, null);
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
				} catch (refreshError) {
					// Refresh failed, logout
					console.error('Token refresh error:', refreshError);
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
	http().get<T>(url, { params }).then((r) => {
		// Handle 304 Not Modified - return undefined to indicate no change
		// The frontend should preserve existing state when receiving undefined
		if (r.status === 304) {
			return undefined;
		}
		return r.data;
	});

export const post = <T = unknown>(url: string, data?: unknown) =>
	http().post<T>(url, data).then((r) => r.data);

export const put = <T = unknown>(url: string, data?: unknown) =>
	http().put<T>(url, data).then((r) => r.data);

export const patch = <T = unknown>(url: string, data?: unknown) =>
  http().patch<T>(url, data).then((r) => r.data);

export const del = <T = unknown>(url: string) =>
	http().delete<T>(url).then((r) => r.data);


