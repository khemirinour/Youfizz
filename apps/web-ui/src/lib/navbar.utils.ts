import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore, type User } from '@/stores/authStore';

/**
 * Hook to handle Zustand persist hydration for navbar components
 * Prevents hydration mismatches between server and client
 */
export function useNavbarHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const api = (useAuthStore as any).persist;
    if (api?.hasHydrated?.()) {
      setHydrated(true);
    } else {
      const unsub = api?.onFinishHydration?.(() => setHydrated(true));
      return () => unsub?.();
    }
  }, []);

  return hydrated;
}

/**
 * Get user display information (name and initials)
 */
export function getUserDisplayInfo(user: User | null) {
  const userName = user 
    ? `${user.firstName} ${user.lastName}`.trim() || user.email 
    : '';
  
  const userInitials = user 
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 
      user.email?.[0]?.toUpperCase() || 'U'
    : 'U';

  return { userName, userInitials };
}

/**
 * Get dashboard path based on user role
 */
export function getDashboardPath(user: User | null): string {
  if (!user) return '/';
  
  switch (user.role) {
    case 'admin':
      return '/admin';
    case 'vendeur':
      return '/vendor';
    case 'confermateur':
      return '/confermateur';
    default:
      return '/';
  }
}

/**
 * Check if a route is currently active
 * Handles nested routes and exact matches
 */
export function isRouteActive(pathname: string, targetPath: string, exact: boolean = false): boolean {
  if (exact) {
    return pathname === targetPath;
  }

  // Exact match
  if (pathname === targetPath) {
    return true;
  }

  // Handle root path specially
  if (targetPath === '/') {
    return pathname === '/';
  }

  // Check if pathname starts with targetPath (for nested routes)
  // But ensure we don't match partial segments (e.g., /shop shouldn't match /shopping)
  if (pathname.startsWith(targetPath)) {
    // Ensure it's a complete segment match
    const nextChar = pathname[targetPath.length];
    return !nextChar || nextChar === '/' || nextChar === '?';
  }

  return false;
}

/**
 * Enhanced route active check with multiple patterns
 * Useful for routes that can match multiple patterns
 */
export function isRouteActivePattern(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => isRouteActive(pathname, pattern));
}

