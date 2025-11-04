'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import VendorNavbar from '@/components/VendorNavbar';
import { getArticleHealth } from '@/lib/articles.api';
import { Card } from '@/components/ui/card';

const VendorDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated, vendorId } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [healthLoading, setHealthLoading] = useState(true);

  // Wait for Zustand persist hydration
  useEffect(() => {
    const api = (useAuthStore as any).persist;
    if (api?.hasHydrated?.()) setHydrated(true);
    const unsub = api?.onFinishHydration?.(() => setHydrated(true));
    return () => unsub?.();
  }, []);

  useEffect(() => {
    // Redirect non-vendors to sign in (after hydration)
    if (!hydrated) return;
    if (!isAuthenticated || user?.role !== 'vendeur') {
      router.replace('/signin');
    }
  }, [hydrated, isAuthenticated, user?.role, router]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'vendeur') return;
    const fetchHealth = async () => {
      try {
        setHealthLoading(true);
        const health = await getArticleHealth();
        setHealthStatus(health?.status || 'unknown');
      } catch (e) {
        setHealthStatus('down');
      } finally {
        setHealthLoading(false);
      }
    };
    fetchHealth();
  }, [hydrated, isAuthenticated, user?.role]);

  if (!hydrated || !isAuthenticated || user?.role !== 'vendeur') return null;

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 z-0" style={{ background: 'var(--gradient-radial)' }} />
      <VendorNavbar />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
          <p className="text-muted-foreground">Manage your articles and track your inventory</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-glass rounded-xl p-6">
            <p className="text-sm text-muted-foreground">Article Service Status</p>
            <p className="text-3xl font-semibold mt-2">
              {healthLoading ? 'Loading...' : healthStatus || 'unknown'}
            </p>
          </Card>
          <Card className="card-glass rounded-xl p-6">
            <p className="text-sm text-muted-foreground">Vendor ID</p>
            <p className="text-3xl font-semibold mt-2">{vendorId || 'N/A'}</p>
          </Card>
        </div>

        <div className="card-glass rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/vendor/articles')}
              className="card-glass rounded-lg p-4 text-left hover:bg-primary/5 transition-colors"
            >
              <h3 className="font-semibold mb-1">View All Articles</h3>
              <p className="text-sm text-muted-foreground">Browse and manage your articles</p>
            </button>
            <button
              onClick={() => router.push('/vendor/articles/new')}
              className="card-glass rounded-lg p-4 text-left hover:bg-primary/5 transition-colors"
            >
              <h3 className="font-semibold mb-1">Create New Article</h3>
              <p className="text-sm text-muted-foreground">Add a new product to your inventory</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;

