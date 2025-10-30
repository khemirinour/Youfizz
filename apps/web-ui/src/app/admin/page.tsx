'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getUsers, updateUserRole, setUserActive, deleteUser } from '@/lib/admin.api';
import type { AdminUser, UserRole } from '@/types/user';

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

  if (!hydrated || !isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="absolute inset-0 z-0" style={{ background: 'var(--gradient-radial)' }} />
      <LanguageSwitcher />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-1">Manage users, articles and system status</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/')}>Back to Home</Button>
        </div>

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
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="VENDEUR">VENDEUR</SelectItem>
                    <SelectItem value="CONFERMATEUR">CONFERMATEUR</SelectItem>
                    <SelectItem value="GUEST">GUEST</SelectItem>
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
    </div>
  );
};

export default AdminDashboard;


