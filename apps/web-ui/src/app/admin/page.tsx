'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import AdminNavbar from '@/components/AdminNavbar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getUsers, updateUserRole, setUserActive, deleteUser, incrementVendeurNbrCmdConf, getUserStats, getOrderStats, getArticleStats } from '@/lib/admin.api';
import type { AdminUser, UserRole } from '@/types/user';
import type { UserStats, OrderStats, ArticleStats } from '@/lib/admin.api';
import AnimatedBackground from '@/components/background/AnimatedBackground';
import { RefreshCw, Users, ShoppingCart, Package, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [incrementDialogOpen, setIncrementDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [incrementAmount, setIncrementAmount] = useState<string>('1');
  const [activeTab, setActiveTab] = useState<'users' | 'stats'>(
    (searchParams.get('tab') as 'users' | 'stats') || 'users'
  );
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [articleStats, setArticleStats] = useState<ArticleStats | null>(null);

  // Wait for Zustand persist hydration
  useEffect(() => {
    const api = (useAuthStore as any).persist;
    if (api?.hasHydrated?.()) setHydrated(true);
    const unsub = api?.onFinishHydration?.(() => setHydrated(true));
    return () => unsub?.();
  }, []);

  // Sync activeTab with URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab') as 'users' | 'stats' | null;
    if (tab === 'stats' || tab === 'users') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect non-admins to sign in (after hydration)
    if (!hydrated) return;
    if (!isAuthenticated || user?.role !== 'admin') {
      router.replace('/signin');
    }
  }, [hydrated, isAuthenticated, user?.role, router]);

  // Fetch users
  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'admin') return;
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const roleParam = roleFilter === 'ALL' ? undefined : roleFilter;
        const res = await getUsers({
          role: roleParam,
          page,
          limit: pageSize,
        });
        setUsers(res?.items || []);
        setTotal(res?.total || 0);
      } catch (e: any) {
        toast({ title: 'Error', description: e?.message || 'Failed to load users', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [hydrated, isAuthenticated, user?.role, roleFilter, page, pageSize]);

  const stats = useMemo(() => {
    const totalCount = total;
    const byRole: Record<string, number> = {};
    (users || []).forEach(u => { byRole[u.role] = (byRole[u.role] || 0) + 1; });
    return { total: totalCount, byRole };
  }, [users, total]);

  // Fetch statistics when stats tab is active
  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'admin' || activeTab !== 'stats') return;
    
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        const [userStatsData, orderStatsData, articleStatsData] = await Promise.all([
          getUserStats(),
          getOrderStats(),
          getArticleStats(),
        ]);
        setUserStats(userStatsData || null);
        setOrderStats(orderStatsData || null);
        setArticleStats(articleStatsData || null);
      } catch (e: any) {
        const errorMessage = e?.response?.data?.message || e?.message || 'Failed to load statistics';
        setStatsError(errorMessage);
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [hydrated, isAuthenticated, user?.role, activeTab]);

  // Expose fetchStats for manual refresh
  const handleRefreshStats = async () => {
    if (!hydrated || !isAuthenticated || user?.role !== 'admin') return;
    try {
      setStatsLoading(true);
      setStatsError(null);
      const [userStatsData, orderStatsData, articleStatsData] = await Promise.all([
        getUserStats(),
        getOrderStats(),
        getArticleStats(),
      ]);
      setUserStats(userStatsData || null);
      setOrderStats(orderStatsData || null);
      setArticleStats(articleStatsData || null);
      toast({ title: 'Success', description: 'Statistics refreshed successfully' });
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || e?.message || 'Failed to load statistics';
      setStatsError(errorMessage);
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setStatsLoading(false);
    }
  };

  if (!hydrated || !isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <AnimatedBackground />
      <AdminNavbar activeTab={activeTab} />

      <div className="relative z-20 max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        {/* Stats Section */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            {/* Header with Refresh Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-foreground">Statistics Dashboard</h2>
                <p className="text-muted-foreground">Comprehensive overview of system statistics and metrics</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshStats}
                disabled={statsLoading}
                className="flex items-center gap-2"
              >
                {statsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>Refresh</span>
              </Button>
            </div>

            {/* Loading State */}
            {statsLoading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading statistics...</p>
              </div>
            )}

            {/* Error State */}
            {!statsLoading && statsError && (
              <Card className="border-destructive bg-destructive/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-semibold text-destructive">Failed to Load Statistics</p>
                      <p className="text-sm text-muted-foreground mt-1">{statsError}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshStats}
                      className="ml-auto"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistics Content */}
            {!statsLoading && !statsError && (
              <div className="space-y-8">
                {/* User Statistics */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">User Statistics</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="card-glass border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-foreground">{userStats?.total?.toLocaleString() ?? 0}</p>
                      </CardContent>
                    </Card>
                    <Card className="card-glass border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-green-600">{userStats?.active?.toLocaleString() ?? 0}</p>
                        {userStats?.total && userStats.total > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {((userStats.active / userStats.total) * 100).toFixed(1)}% of total
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="card-glass border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-muted-foreground">{userStats?.inactive?.toLocaleString() ?? 0}</p>
                        {userStats?.total && userStats.total > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {((userStats.inactive / userStats.total) * 100).toFixed(1)}% of total
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="card-glass border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Vendeurs with Cmd</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-primary">{userStats?.vendeursWithCmdConf?.toLocaleString() ?? 0}</p>
                      </CardContent>
                    </Card>
                  </div>
                  {userStats?.byRole && Object.keys(userStats.byRole).length > 0 && (
                    <Card className="card-glass border-border">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold">Users by Role</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(userStats.byRole).map(([role, count]) => (
                            <div key={role} className="flex flex-col p-3 rounded-lg bg-secondary/50">
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{role}</span>
                              <span className="text-2xl font-bold mt-2 text-foreground">{count.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Order Statistics */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">Order Statistics</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="card-glass border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-foreground">{orderStats?.total?.toLocaleString() ?? 0}</p>
                      </CardContent>
                    </Card>
                    <Card className="card-glass border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Paid Orders</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-green-600">{orderStats?.paid?.toLocaleString() ?? 0}</p>
                        {orderStats?.total && orderStats.total > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {((orderStats.paid / orderStats.total) * 100).toFixed(1)}% paid
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="card-glass border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Unpaid Orders</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-orange-600">{orderStats?.unpaid?.toLocaleString() ?? 0}</p>
                        {orderStats?.total && orderStats.total > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {((orderStats.unpaid / orderStats.total) * 100).toFixed(1)}% unpaid
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="card-glass border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold text-foreground">
                            {orderStats?.totalRevenue ? orderStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                          </p>
                          <span className="text-sm text-muted-foreground">TND</span>
                        </div>
                        {orderStats?.totalRevenue && orderStats.totalRevenue > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <TrendingUp className="h-3 w-3 inline mr-1" />
                            Average: {(orderStats.totalRevenue / (orderStats.paid || 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TND
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  {orderStats?.byStatus && Object.keys(orderStats.byStatus).length > 0 && (
                    <Card className="card-glass border-border">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold">Orders by Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {Object.entries(orderStats.byStatus).map(([status, count]) => (
                            <div key={status} className="flex flex-col p-3 rounded-lg bg-secondary/50">
                              <span className="text-xs font-medium text-muted-foreground capitalize">{status.toLowerCase()}</span>
                              <span className="text-2xl font-bold mt-2 text-foreground">{count.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="card-glass border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-green-600">{orderStats?.active?.toLocaleString() ?? 0}</p>
                      </CardContent>
                    </Card>
                    <Card className="card-glass border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Orders</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-muted-foreground">{orderStats?.inactive?.toLocaleString() ?? 0}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Article Statistics */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">Article Statistics</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="card-glass border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Articles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-foreground">{articleStats?.total?.toLocaleString() ?? 0}</p>
                      </CardContent>
                    </Card>
                    <Card className="card-glass border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Articles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-green-600">{articleStats?.active?.toLocaleString() ?? 0}</p>
                        {articleStats?.total && articleStats.total > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {((articleStats.active / articleStats.total) * 100).toFixed(1)}% active
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="card-glass border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Articles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-muted-foreground">{articleStats?.inactive?.toLocaleString() ?? 0}</p>
                        {articleStats?.total && articleStats.total > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {((articleStats.inactive / articleStats.total) * 100).toFixed(1)}% inactive
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="card-glass border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-primary">{articleStats?.totalStock?.toLocaleString() ?? 0}</p>
                        {articleStats?.total && articleStats.total > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Avg: {Math.round((articleStats.totalStock || 0) / articleStats.total).toLocaleString()} per article
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  {articleStats?.byStatus && Object.keys(articleStats.byStatus).length > 0 && (
                    <Card className="card-glass border-border">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold">Articles by Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(articleStats.byStatus).map(([status, count]) => (
                            <div key={status} className="flex flex-col p-3 rounded-lg bg-secondary/50">
                              <span className="text-xs font-medium text-muted-foreground capitalize">{status.toLowerCase()}</span>
                              <span className="text-2xl font-bold mt-2 text-foreground">{count.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Empty State - if all stats are null/undefined */}
                {!userStats && !orderStats && !articleStats && (
                  <Card className="border-border">
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No statistics available</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRefreshStats}
                          className="mt-4"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Users Section */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-glass rounded-xl p-6">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-semibold mt-2">{stats.total}</p>
              </div>
              <div className="card-glass rounded-xl p-6">
                <p className="text-sm text-muted-foreground">By Role</p>
                <p className="text-sm mt-2 text-muted-foreground">{Object.entries(stats.byRole).map(([r,c]) => `${r}: ${c}`).join('  •  ') || '—'}</p>
              </div>
              <div className="card-glass rounded-xl p-6">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold mt-2">{loading ? 'Loading…' : 'Ready'}</p>
              </div>
            </div>

            {/* Users table */}
            <div className="card-glass rounded-xl p-6 bg-card border border-border">
              <div className="flex items-center justify-between mb-4 gap-4">
                <h2 className="text-lg font-semibold">Users</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <Select value={roleFilter} onValueChange={(v) => { setPage(1); setRoleFilter(v as any); }}>
                      <SelectTrigger className="h-9 w-48">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All</SelectItem>
                        <SelectItem value="admin">ADMIN</SelectItem>
                        <SelectItem value="vendeur">VENDEUR</SelectItem>
                        <SelectItem value="confermateur">CONFERMATEUR</SelectItem>
                        <SelectItem value="guest">GUEST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Page size</span>
                    <Select value={String(pageSize)} onValueChange={(v) => { setPage(1); setPageSize(Number(v)); }}>
                      <SelectTrigger className="h-9 w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page===1 || loading} onClick={() => setPage((p)=>Math.max(1, p-1))}>Prev</Button>
                    <span className="text-sm text-muted-foreground">{page} / {Math.max(1, Math.ceil(total / pageSize))}</span>
                    <Button variant="outline" size="sm" disabled={page>=Math.ceil(total/pageSize) || loading} onClick={() => setPage((p)=>p+1)}>Next</Button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border/70">
                <table className="w-full text-sm bg-card/60">
                  <thead className="text-left text-muted-foreground bg-secondary/80 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-secondary/70 border-b border-border/70">
                    <tr>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide whitespace-nowrap">Name</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide whitespace-nowrap">Email</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide whitespace-nowrap">Role</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide whitespace-nowrap">Cmd Conf</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide whitespace-nowrap">Associated Vendeurs</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide whitespace-nowrap">Active</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide whitespace-nowrap text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {users.map(u => (
                      <tr key={u.id} className="odd:bg-transparent even:bg-secondary/50 hover:bg-secondary/70 transition-colors">
                        <td className="px-4 py-3 pr-4 align-middle text-foreground max-w-[220px] truncate" title={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</td>
                        <td className="px-4 py-3 pr-4 align-middle text-foreground max-w-[260px] truncate" title={u.email}>{u.email}</td>
                        <td className="px-4 py-3 pr-4 align-middle">
                          <Select value={u.role} onValueChange={async (v) => {
                            try {
                              const updated = await updateUserRole(u.id, v as UserRole);
                              setUsers(prev => prev.map(x => x.id === u.id ? updated : x));
                              toast({ title: 'Success', description: 'Role updated' });
                            } catch (e: any) {
                              toast({ title: 'Error', description: e?.message || 'Failed to update role', variant: 'destructive' });
                            }
                          }}>
                            <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">ADMIN</SelectItem>
                              <SelectItem value="vendeur">VENDEUR</SelectItem>
                              <SelectItem value="confermateur">CONFERMATEUR</SelectItem>
                              <SelectItem value="guest">GUEST</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 pr-4 align-middle">
                          {u.role === 'vendeur' ? (
                            <span className="text-sm font-medium">{u.nbrCmdConf ?? 0}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 pr-4 align-middle">
                          {u.role === 'confermateur' ? (
                            u.vendeurs && u.vendeurs.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {u.vendeurs.map((v) => (
                                  <span 
                                    key={v.id} 
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-primary/10 text-primary border border-primary/20"
                                    title={`${v.firstName} ${v.lastName}`}
                                  >
                                    {v.firstName} {v.lastName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">No vendeurs</span>
                            )
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 pr-4 align-middle">
                          <Button variant={u.isActive ? 'outline' : 'hero'} size="sm" onClick={async () => {
                            try {
                              const updated = await setUserActive(u.id, !u.isActive);
                              setUsers(prev => prev.map(x => x.id === u.id ? updated : x));
                              toast({ title: 'Success', description: updated.isActive ? 'Activated' : 'Deactivated' });
                            } catch (e: any) {
                              toast({ title: 'Error', description: e?.message || 'Failed to update status', variant: 'destructive' });
                            }
                          }}>{u.isActive ? 'Active' : 'Inactive'}</Button>
                        </td>
                        <td className="px-4 py-3 pr-0 text-right align-middle whitespace-nowrap">
                          <div className="flex items-center gap-2 justify-end">
                            {u.role === 'vendeur' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  setSelectedUser(u);
                                  setIncrementAmount('1');
                                  setIncrementDialogOpen(true);
                                }}
                                title="Increment nbrCmdConf"
                              >
                                Increment
                              </Button>
                            )}
                            <Button variant="destructive" size="sm" onClick={async () => {
                              if (!confirm('Delete this user?')) return;
                              try {
                                await deleteUser(u.id);
                                setUsers(prev => prev.filter(x => x.id !== u.id));
                                toast({ title: 'Success', description: 'User deleted' });
                              } catch (e: any) {
                                toast({ title: 'Error', description: e?.message || 'Failed to delete user', variant: 'destructive' });
                              }
                            }}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!loading && users.length === 0) && (
                  <div className="text-center text-muted-foreground py-8">No users</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Increment Dialog */}
      <Dialog open={incrementDialogOpen} onOpenChange={setIncrementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Increment nbrCmdConf</DialogTitle>
            <DialogDescription>
              Enter the amount to increment for {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-value">Current nbrCmdConf</Label>
              <Input
                id="current-value"
                value={selectedUser?.nbrCmdConf ?? 0}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="increment-amount">Increment Amount</Label>
              <Input
                id="increment-amount"
                type="number"
                min="1"
                value={incrementAmount}
                onChange={(e) => setIncrementAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIncrementDialogOpen(false);
                setSelectedUser(null);
                setIncrementAmount('1');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedUser) return;
                const amount = parseInt(incrementAmount, 10);
                if (isNaN(amount) || amount < 1) {
                  toast({
                    title: 'Error',
                    description: 'Please enter a valid positive number',
                    variant: 'destructive',
                  });
                  return;
                }
                try {
                  const result = await incrementVendeurNbrCmdConf(selectedUser.id, amount);
                  setUsers(prev => prev.map(x =>
                    x.id === selectedUser.id ? { ...x, nbrCmdConf: result.nbrCmdConf } : x
                  ));
                  toast({
                    title: 'Success',
                    description: `nbrCmdConf incremented by ${amount} to ${result.nbrCmdConf}`,
                  });
                  setIncrementDialogOpen(false);
                  setSelectedUser(null);
                  setIncrementAmount('1');
                } catch (e: any) {
                  toast({
                    title: 'Error',
                    description: e?.message || 'Failed to increment nbrCmdConf',
                    variant: 'destructive',
                  });
                }
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
