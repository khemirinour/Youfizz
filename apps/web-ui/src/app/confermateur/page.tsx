'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import ConfermateurNavbar from '@/components/ConfermateurNavbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getOrders, confirmOrder, updateOrder, type Order } from '@/lib/orders.api';
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
  const [orderNotes, setOrderNotes] = useState<Record<string, string>>({});

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

  // Verify authentication and refresh token if needed
  useEffect(() => {
    if (!hydrated) return;
    
    const verifyAuth = async () => {
      // If we think we're authenticated but tokens might be missing, try to refresh
      if (isAuthenticated && user?.role === 'confermateur') {
        try {
          // Attempt to refresh token to verify we still have valid cookies
          const refreshed = await useAuthStore.getState().refreshToken();
          if (!refreshed) {
            // Refresh failed, redirect to signin
            router.replace('/signin');
          }
        } catch (error) {
          // Refresh failed, redirect to signin
          router.replace('/signin');
        }
      } else {
        // Not authenticated, redirect to signin
        router.replace('/signin');
      }
    };

    verifyAuth();
  }, [hydrated, isAuthenticated, user?.role, router]);

  // Fetch orders
  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'confermateur') return;
    
    // Wait for vendors to be loaded first
    if (vendors.length === 0 && !loadingVendors) {
      // If vendors are not loading and we have none, set empty orders
      setOrders([]);
      return;
    }
    
    // If vendors are still loading, wait for them
    if (loadingVendors) {
      return;
    }
    
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // If no vendors, set empty orders
        if (vendors.length === 0) {
          setOrders([]);
          return;
        }
        
        // Fetch orders for each vendor and combine them
        const vendorIds = vendors.map(v => v.vendorId).filter(Boolean);
        
        if (vendorIds.length === 0) {
          setOrders([]);
          return;
        }
        
        // Fetch orders for all vendors
        const orderPromises = vendorIds.map(vendorId => 
          getOrders({ limit: 100, offset: 0, vendorId })
        );
        
        const results = await Promise.all(orderPromises);
        
        // Combine all orders and remove duplicates
        const allOrders = results
          .filter((res): res is { items: Order[] } => res !== undefined && res.items !== undefined)
          .flatMap(res => res.items);
        
        // Remove duplicates by order ID
        const uniqueOrders = Array.from(
          new Map(allOrders.map(order => [order.id, order])).values()
        );
        
        // Sort by creation date (newest first)
        uniqueOrders.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        // Limit to 10 most recent
        setOrders(uniqueOrders.slice(0, 10));
      } catch (e: any) {
        toast({ title: 'Error', description: e?.message || 'Failed to load orders', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [hydrated, isAuthenticated, user?.role, vendors, loadingVendors]);

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
      
      // Check if order is already confirmed
      if (order?.status === 'CONFIRMED') {
        toast({
          title: 'Error',
          description: 'Order is already confirmed',
          variant: 'destructive',
        });
        return;
      }
      
      const idvendor = order?.vendorId;
      const notes = orderNotes[orderId] || undefined;
      const updated = await confirmOrder(orderId, idvendor, notes);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      // Clear notes for this order after successful confirmation
      setOrderNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[orderId];
        return newNotes;
      });
      toast({ title: 'Success', description: 'Order confirmed successfully' });
    } catch (e: any) {
      // Show specific error messages
      const errorMessage = e?.message || 'Failed to confirm order';
      let title = 'Error';
      
      if (errorMessage.includes('already confirmed')) {
        title = 'Already Confirmed';
      } else if (errorMessage.includes('no remaining confirmations') || errorMessage.includes('nbrCmdConf')) {
        title = 'No Confirmations Available';
      }
      
      toast({ 
        title, 
        description: errorMessage, 
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
                      <p>
                        Customer:{' '}
                        {(() => {
                          const isHidden = !order.customerName && !order.customerEmail;
                          const fakeName = 'John Doe';
                          const fakeEmail = 'customer@example.com';
                          const display = order.customerName || order.customerEmail || fakeName;
                          return (
                            <span className={isHidden ? 'blur-sm select-none' : ''}>
                              {display}
                            </span>
                          );
                        })()}
                      </p>
                      <p>Total: {order.total} TND</p>
                      {order.createdAt && (
                        <p className="text-xs mt-1">
                          Created: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {order.status === 'CONFIRMED' ? (
                      order.notes && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Notes: {order.notes}
                        </div>
                      )
                    ) : (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Add or edit notes (optional)..."
                            value={orderNotes[order.id] !== undefined ? orderNotes[order.id] : (order.notes || '')}
                            onChange={(e) => setOrderNotes(prev => ({ ...prev, [order.id]: e.target.value }))}
                            className="flex-1 text-sm"
                            disabled={confirming === order.id}
                          />
                          {orderNotes[order.id] !== undefined && orderNotes[order.id] !== (order.notes || '') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  setConfirming(order.id);
                                  const updated = await updateOrder(order.id, { notes: orderNotes[order.id] || null });
                                  if (updated) {
                                    setOrders(prev => prev.map(o => o.id === order.id ? updated : o));
                                    // Clear the local note state after successful update
                                    setOrderNotes(prev => {
                                      const newNotes = { ...prev };
                                      delete newNotes[order.id];
                                      return newNotes;
                                    });
                                    toast({ title: 'Success', description: 'Notes updated successfully' });
                                  }
                                } catch (e: any) {
                                  toast({ 
                                    title: 'Error', 
                                    description: e?.message || 'Failed to update notes', 
                                    variant: 'destructive' 
                                  });
                                } finally {
                                  setConfirming(null);
                                }
                              }}
                              disabled={confirming === order.id}
                            >
                              Save
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {order.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(order.id)}
                        disabled={confirming === order.id || order.status === 'CONFIRMED'}
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




