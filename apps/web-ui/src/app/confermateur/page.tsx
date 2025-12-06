'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import ConfermateurNavbar from '@/components/ConfermateurNavbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getOrders, confirmOrder, type Order } from '@/lib/orders.api';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Clock, Package, ShoppingCart } from 'lucide-react';
import AnimatedBackground from '@/components/background/AnimatedBackground';
import { getVendeursForConfermateur, type ConfermateurVendeur } from '@/lib/confermateur.api';

const ConfermateurDashboard = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [vendors, setVendors] = useState<ConfermateurVendeur[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);

  const hasFetchedOrders = useRef(false);
  const vendorsFetchController = useRef<AbortController | null>(null);
  const vendorsFetchKey = useRef<string | null>(null);

  // Wait for Zustand persist hydration
  useEffect(() => {
    const api = (useAuthStore as any).persist;
    if (api?.hasHydrated?.()) setHydrated(true);
    const unsub = api?.onFinishHydration?.(() => setHydrated(true));
    return () => unsub?.();
  }, []);

  useEffect(() => {
    // Redirect non-confermateurs to sign in (after hydration)
    if (!hydrated) return;
    if (!isAuthenticated || user?.role !== 'confermateur') {
      router.replace('/signin');
    }
  }, [hydrated, isAuthenticated, user?.role, router]);

  // Fetch orders
  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'confermateur') return;
    if (hasFetchedOrders.current) return;
    hasFetchedOrders.current = true;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await getOrders({ limit: 10, offset: 0 });
        setOrders(res.items || []);
      } catch (e: any) {
        toast({ title: 'Error', description: e?.message || 'Failed to load orders', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [hydrated, isAuthenticated, user?.role]);

  // Fetch vendors assigned to this confermateur
  useEffect(() => {
    // Early returns for invalid states
    if (!hydrated || !isAuthenticated || user?.role !== 'confermateur' || !user?.id) {
      if (!user?.id) {
        setVendors([]);
        vendorsFetchKey.current = null;
      }
      return;
    }

    // Create a unique key for this fetch (pathname + user.id)
    const currentKey = `${pathname}-${user.id}`;

    // Skip if already fetched for this key
    if (vendorsFetchKey.current === currentKey) {
      return;
    }

    // Mark as fetching for this key
    vendorsFetchKey.current = currentKey;

    // Abort any previous fetch
    if (vendorsFetchController.current) {
      vendorsFetchController.current.abort();
    }

    // Create new abort controller for this fetch
    const abortController = new AbortController();
    vendorsFetchController.current = abortController;

    let isMounted = true;

    const fetchVendors = async () => {
      try {
        setLoadingVendors(true);
        const res = await getVendeursForConfermateur(user.id);
        
        // Only update state if component is still mounted and fetch wasn't aborted
        // If res is undefined, it means we got a 304 Not Modified - preserve existing state
        if (isMounted && !abortController.signal.aborted && res !== undefined) {
          setVendors(res || []);
        }
        // If res is undefined (304 response), we keep the existing vendors state
      } catch (e: any) {
        // Don't show error if fetch was aborted or component unmounted
        if (abortController.signal.aborted || !isMounted) {
          return;
        }
        toast({
          title: 'Error',
          description: e?.message || 'Failed to load your vendors',
          variant: 'destructive',
        });
        // Reset key on error so it can retry
        if (vendorsFetchKey.current === currentKey) {
          vendorsFetchKey.current = null;
        }
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setLoadingVendors(false);
        }
      }
    };

    // Use a small timeout to ensure state is stable, especially on refresh
    const timeoutId = setTimeout(() => {
      fetchVendors();
    }, 50);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      abortController.abort();
      vendorsFetchController.current = null;
    };
  }, [hydrated, isAuthenticated, user?.role, user?.id, pathname]);

  const stats = useMemo(() => {
    const pending = orders.filter(o => o.status === 'PENDING').length;
    const confirmed = orders.filter(o => o.status === 'CONFIRMED').length;
    const total = orders.length;
    return { pending, confirmed, total };
  }, [orders]);

  const handleConfirm = async (orderId: string) => {
    try {
      setConfirming(orderId);
      // Get vendorId from the order if available
      const order = orders.find(o => o.id === orderId);
      const idvendor = order?.vendorId;
      const updated = await confirmOrder(orderId, idvendor);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      toast({ title: 'Success', description: 'Order confirmed successfully' });
    } catch (e: any) {
      toast({ 
        title: 'Error', 
        description: e?.message || 'Failed to confirm order', 
        variant: 'destructive' 
      });
    } finally {
      setConfirming(null);
    }
  };

  if (!hydrated || !isAuthenticated || user?.role !== 'confermateur') return null;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <AnimatedBackground />
      <ConfermateurNavbar />

      <div className="relative z-20 max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome to Your Dashboard</h1>
          <p className="text-muted-foreground">Manage and confirm orders</p>
        </div>

        {/* My Vendors */}
        <Card className="rounded-xl p-6 shadow-lg border-border bg-card">
          <h2 className="text-xl font-semibold mb-4 text-foreground">My Vendors</h2>
          {loadingVendors ? (
            <p className="text-sm text-muted-foreground">Loading your vendors...</p>
          ) : vendors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You do not have any vendors assigned yet.
            </p>
          ) : (
            <div className="space-y-2">
              {vendors.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between border border-border rounded-lg px-3 py-2 bg-secondary/30"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {v.firstName} {v.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{v.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-xl p-6 shadow-lg border-border bg-card">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-3xl font-semibold mt-1 text-foreground">{stats.pending}</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-xl p-6 shadow-lg border-border bg-card">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmed Orders</p>
                <p className="text-3xl font-semibold mt-1 text-foreground">{stats.confirmed}</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-xl p-6 shadow-lg border-border bg-card">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-semibold mt-1 text-foreground">{stats.total}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="rounded-xl p-6 shadow-lg border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Orders</h2>
            <Button variant="outline" onClick={() => router.push('/confermateur/orders')}>
              View All Orders
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/50 hover:bg-secondary/80 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-foreground">#{order.orderNumber}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'PENDING'
                            ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                            : order.status === 'CONFIRMED'
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                            : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Customer: {order.customerName || order.customerEmail || 'N/A'}</p>
                      <p>Total: {order.total} TND</p>
                      {order.createdAt && (
                        <p className="text-xs mt-1">
                          Created: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(order.id)}
                        disabled={confirming === order.id}
                      >
                        {confirming === order.id ? 'Confirming...' : 'Confirm'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="rounded-xl p-6 shadow-lg border-border bg-card">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/confermateur/orders')}
              className="bg-secondary hover:bg-secondary/80 rounded-lg p-4 text-left transition-colors border border-border/60"
            >
              <h3 className="font-semibold mb-1 text-foreground">View All Orders</h3>
              <p className="text-sm text-muted-foreground">Browse and manage all orders</p>
            </button>
            <button
              onClick={() => router.push('/confermateur/orders?status=PENDING')}
              className="bg-secondary hover:bg-secondary/80 rounded-lg p-4 text-left transition-colors border border-border/60"
            >
              <h3 className="font-semibold mb-1 text-foreground">Pending Orders</h3>
              <p className="text-sm text-muted-foreground">View orders awaiting confirmation</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConfermateurDashboard;




