'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import VendorNavbar from '@/components/VendorNavbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { getOrders, type Order } from '@/lib/orders.api';
import { useToast } from '@/hooks/use-toast';
import { useOrdersStore, generateOrdersCacheKey } from '@/stores/ordersStore';
import { CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import AnimatedBackground from '@/components/background/AnimatedBackground';

const VendorOrdersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, vendorId } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

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

  // Get cached data from store for initial render
  const { getCachedOrders } = useOrdersStore();
  const cacheKey = generateOrdersCacheKey({
    vendorId,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    search: searchQuery || undefined,
    page,
    pageSize,
  });

  // Initialize from cache if available
  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'vendeur' || !vendorId) return;
    const cached = getCachedOrders(cacheKey);
    if (cached) {
      setOrders(cached.items || []);
      setTotal(cached.total || 0);
    }
  }, [hydrated, isAuthenticated, user?.role, vendorId, cacheKey, getCachedOrders]);

  // Fetch orders filtered by vendorId
  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'vendeur' || !vendorId) return;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const params: any = {
          vendorId,
          limit: pageSize,
          offset: page * pageSize,
        };
        if (statusFilter !== 'ALL') {
          params.status = statusFilter;
        }
        if (searchQuery) {
          params.search = searchQuery;
        }
        const res = await getOrders(params);
        // Store will handle caching, so we always update local state if we get data
        // If res is undefined, store will return cached data, so we check store again
        if (res !== undefined) {
          setOrders(res.items || []);
          setTotal(res.total || 0);
        } else {
          // If API returned undefined (304), check store for cached data
          const cached = getCachedOrders(cacheKey);
          if (cached) {
            setOrders(cached.items || []);
            setTotal(cached.total || 0);
          }
        }
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e?.message || 'Failed to load orders',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [hydrated, isAuthenticated, user?.role, vendorId, page, pageSize, statusFilter, searchQuery, cacheKey, getCachedOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(0);
  };

  const totalPages = Math.ceil(total / pageSize);

  if (!hydrated || !isAuthenticated || user?.role !== 'vendeur' || !vendorId) return null;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <AnimatedBackground />
      <VendorNavbar />

      <div className="relative z-20 max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">My Orders</h1>
          <p className="text-muted-foreground">View and filter your orders</p>
        </div>

        {/* Filters */}
        <Card className="rounded-xl p-6 shadow-lg border-border bg-card">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Orders Table */}
        <Card className="rounded-xl p-6 shadow-lg border-border bg-card">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground bg-secondary/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-xs font-medium uppercase">Order #</th>
                        <th className="px-4 py-3 text-xs font-medium uppercase">Customer</th>
                        <th className="px-4 py-3 text-xs font-medium uppercase">Total</th>
                        <th className="px-4 py-3 text-xs font-medium uppercase">Status</th>
                        <th className="px-4 py-3 text-xs font-medium uppercase">Paid</th>
                        <th className="px-4 py-3 text-xs font-medium uppercase">Active</th>
                        <th className="px-4 py-3 text-xs font-medium uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-secondary/30">
                          <td className="px-4 py-3 font-medium text-foreground">#{order.orderNumber}</td>
                          <td className="px-4 py-3 text-foreground">
                            <div>
                              <p className="font-medium">{order.customerName || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-foreground">{order.total} TND</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                order.status === 'PENDING'
                                  ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                                  : order.status === 'CONFIRMED'
                                  ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                                  : order.status === 'SHIPPED'
                                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                  : order.status === 'DELIVERED'
                                  ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                                  : 'bg-red-500/20 text-red-600 dark:text-red-400'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {order.isPaid ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {order.isActive ? (
                              <span className="text-green-600 dark:text-green-400 text-xs font-medium">Active</span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400 text-xs font-medium">Inactive</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {order.createdAt ? (
                              <span className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, total)} of {total} orders
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0 || loading}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {page + 1} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1 || loading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VendorOrdersPage;

