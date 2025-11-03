'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import AdminNavbar from '@/components/AdminNavbar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getUsers, updateUserRole, setUserActive, deleteUser, incrementVendeurNbrCmdConf, getUserStats, getOrderStats, getArticleStats } from '@/lib/admin.api';
import type { AdminUser, UserRole } from '@/types/user';
import type { UserStats, OrderStats, ArticleStats } from '@/lib/admin.api';

const AdminDashboard = () => {
  const router = useRouter();
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
  const [activeTab, setActiveTab] = useState<'users' | 'stats'>('users');
  const [statsLoading, setStatsLoading] = useState(false);
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
        const res = await getUsers({
          role: roleFilter === 'ALL' ? undefined : roleFilter,
          page,
          limit: pageSize,
        });
        setUsers(res.items);
        setTotal(res.total);
      } catch (e: any) {
        toast({ title: 'Error', description: e?.message || 'Failed to load users', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isAuthenticated, user?.role, roleFilter, page, pageSize]);

  const stats = useMemo(() => {
    const totalCount = total;
    const byRole: Record<string, number> = {};
    users.forEach(u => { byRole[u.role] = (byRole[u.role] || 0) + 1; });
    return { total: totalCount, byRole };
  }, [users, total]);

  // Fetch statistics when stats tab is active
  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'admin' || activeTab !== 'stats') return;
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const [userStatsData, orderStatsData, articleStatsData] = await Promise.all([
          getUserStats(),
          getOrderStats(),
          getArticleStats(),
        ]);
        setUserStats(userStatsData);
        setOrderStats(orderStatsData);
        setArticleStats(articleStatsData);
      } catch (e: any) {
        toast({ title: 'Error', description: e?.message || 'Failed to load statistics', variant: 'destructive' });
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [hydrated, isAuthenticated, user?.role, activeTab, toast]);

  if (!hydrated || !isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 z-0" style={{ background: 'var(--gradient-radial)' }} />
      <AdminNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        {/* Stats Section */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Statistics</h2>
              <p className="text-muted-foreground">Comprehensive overview of system statistics and metrics</p>
            </div>

            {statsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading statistics...</p>
              </div>
            ) : (
              <>
                {/* User Statistics */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">User Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card-glass rounded-xl p-6">
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-3xl font-semibold mt-2">{userStats?.total ?? 0}</p>
                    </div>
                    <div className="card-glass rounded-xl p-6">
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-3xl font-semibold mt-2">{userStats?.active ?? 0}</p>
                    </div>
                    <div className="card-glass rounded-xl p-6">
                      <p className="text-sm text-muted-foreground">Inactive Users</p>
                      <p className="text-3xl font-semibold mt-2">{userStats?.inactive ?? 0}</p>
                    </div>
                    <div className="card-glass rounded-xl p-6">
                      <p className="text-sm text-muted-foreground">Vendeurs with Cmd</p>
                      <p className="text-3xl font-semibold mt-2">{userStats?.vendeursWithCmdConf ?? 0}</p>
                    </div>
                  </div>
                  <div className="card-glass rounded-xl p-6">
                    <p className="text-sm text-muted-foreground mb-4">Users by Role</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {userStats?.byRole && Object.entries(userStats.byRole).map(([role, count]) => (
                        <div key={role} className="flex flex-col">
                          <span className="text-xs text-muted-foreground uppercase">{role}</span>
                          <span className="text-2xl font-semibold mt-1">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Order Statistics */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Order Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card-glass rounded-xl p-6">
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-3xl font-semibold mt-2">{orderStats?.total ?? 0}</p>
                    </div>
                    <div className="card-glass rounded-xl p-6">
                      <p className="text-sm text-muted-foreground">Paid Orders</p>
                      <p className="text-3xl font-semibold mt-2">{orderStats?.paid ?? 0}</p>
                    </div>
                    <div className="card-glass rounded-xl p-6">
                      <p className="text-sm text-muted-foreground">Unpaid Orders</p>
                      <p className="text-3xl font-semibold mt-2">{orderStats?.unpaid ?? 0}</p>
                    </div>
                    <div className="card-glass rounded-xl p-6">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-3xl font-semibold mt-2">{orderStats?.totalRevenue ? orderStats.totalRevenue.toFixed(2) : '0.00'}</p>
                      <p className="text-xs text-muted-foreground mt-1">TND</p>
                    </div>
                  </div>
                  <div className="card-glass rounded-xl p-6">
                    <p className="text-sm text-muted-foreground mb-4">Orders by Status</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {orderStats?.byStatus && Object.entries(orderStats.byStatus).map(([status, count]) => (
                        <div key={status} className="flex flex-col">
                          <span className="text-xs text-muted-foreground capitalize">{status.toLowerCase()}</span>
                          <span className="text-2xl font-semibold mt-1">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card-glass rounded-xl p-6">
                      <p className="text-sm text-muted-foreground">Active Orders</p>
                      <p className="text-3xl font-semibold mt-2">{orderStats?.active ?? 0}</p>
                    </div>
                    <div className="card-glass rounded-xl p-6">
                      <p className="text-sm text-muted-foreground">Inactive Orders</p>
                      <p className="text-3xl font-semibold mt-2">{orderStats?.inactive ?? 0}</p>
                    </div>
                  </div>
                </div>

                {/* Article Statistics */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Article Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card-glass rounded-xl p-6">
                      <p className="text-sm text-muted-foreground">Total Articles</p>
                      <p className="text-3xl font-semibold mt-2">{articleStats?.total ?? 0}</p>
                    </div>
                    <div className="card-glass rounded-xl p-6">
                      <p className="text-sm text-muted-foreground">Active Articles</p>
                      <p className="text-3xl font-semibold mt-2">{articleStats?.active ?? 0}</p>
                    </div>
                    <div className="card-glass rounded-xl p-6">
                      <p className="text-sm text-muted-foreground">Inactive Articles</p>
                      <p className="text-3xl font-semibold mt-2">{articleStats?.inactive ?? 0}</p>
                    </div>
                    <div className="card-glass rounded-xl p-6">
                      <p className="text-sm text-muted-foreground">Total Stock</p>
                      <p className="text-3xl font-semibold mt-2">{articleStats?.totalStock ?? 0}</p>
                    </div>
                  </div>
                  <div className="card-glass rounded-xl p-6">
                    <p className="text-sm text-muted-foreground mb-4">Articles by Status</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {articleStats?.byStatus && Object.entries(articleStats.byStatus).map(([status, count]) => (
                        <div key={status} className="flex flex-col">
                          <span className="text-xs text-muted-foreground capitalize">{status.toLowerCase()}</span>
                          <span className="text-2xl font-semibold mt-1">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
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
            <div className="card-glass rounded-xl p-6">
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

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Cmd Conf</th>
                      <th className="py-2 pr-4">Associated Vendeurs</th>
                      <th className="py-2 pr-4">Active</th>
                      <th className="py-2 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-t border-border">
                        <td className="py-3 pr-4">{u.firstName} {u.lastName}</td>
                        <td className="py-3 pr-4">{u.email}</td>
                        <td className="py-3 pr-4">
                          <Select value={u.role} onValueChange={async (v) => {
                            try {
                              const updated = await updateUserRole(u.id, v as UserRole);
                              setUsers(prev => prev.map(x => x.id === u.id ? updated : x));
                              toast({ title: 'Success', description: 'Role updated' });
                            } catch (e: any) {
                              toast({ title: 'Error', description: e?.message || 'Failed to update role', variant: 'destructive' });
                            }
                          }}>
                            <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">ADMIN</SelectItem>
                              <SelectItem value="VENDEUR">VENDEUR</SelectItem>
                              <SelectItem value="CONFERMATEUR">CONFERMATEUR</SelectItem>
                              <SelectItem value="GUEST">GUEST</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 pr-4">
                          {u.role === 'vendeur' ? (
                            <span className="text-sm font-medium">{u.nbrCmdConf ?? 0}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
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
                        <td className="py-3 pr-4">
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
                        <td className="py-3 pr-0 text-right">
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


