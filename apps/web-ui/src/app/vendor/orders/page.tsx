'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import VendorNavbar from '@/components/VendorNavbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  getOrders, 
  getOrder,
  createOrder, 
  updateOrder,
  updateOrderStatus,
  updateOrderPaid,
  confirmOrder,
  activateOrder,
  deactivateOrder,
  type Order,
  type CreateOrderDto,
  type UpdateOrderDto,
  type OrderItemDto,
} from '@/lib/orders.api';
import { getArticlesByVendor, getArticleById, type Article } from '@/lib/articles.api';
import { useToast } from '@/hooks/use-toast';
import { useOrdersStore, generateOrdersCacheKey } from '@/stores/ordersStore';
import { CheckCircle2, XCircle, Search, Filter, Plus, Eye, Edit, Trash2, X } from 'lucide-react';
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
  
  // CRUD state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);
  
  // Create/Edit form state
  const [formData, setFormData] = useState<CreateOrderDto>({
    items: [],
    total: '0.00',
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    vendorId: vendorId || undefined,
  });
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  // Fetch articles for order creation
  useEffect(() => {
    if (!vendorId || !createDialogOpen) return;
    const fetchArticles = async () => {
      try {
        setLoadingArticles(true);
        const res = await getArticlesByVendor(vendorId, { 
          status: 'PUBLISHED',
          isActive: true,
          limit: 100,
        });
        setArticles(res?.items || []);
      } catch (e: any) {
        toast({
          title: 'Error',
          description: 'Failed to load articles',
          variant: 'destructive',
        });
      } finally {
        setLoadingArticles(false);
      }
    };
    fetchArticles();
  }, [vendorId, createDialogOpen, toast]);

  // Fetch articles by ID for edit dialog
  useEffect(() => {
    if (!editDialogOpen || !formData.items || formData.items.length === 0) return;
    const fetchArticlesById = async () => {
      try {
        setLoadingArticles(true);
        const articlePromises = formData.items
          .map(item => item.articleId)
          .filter(id => id) // Filter out empty IDs
          .map(id => getArticleById(id));
        
        const fetchedArticles = await Promise.all(articlePromises);
        const validArticles = fetchedArticles.filter(article => article !== undefined) as Article[];
        setArticles(validArticles);
      } catch (e: any) {
        toast({
          title: 'Error',
          description: 'Failed to load articles',
          variant: 'destructive',
        });
      } finally {
        setLoadingArticles(false);
      }
    };
    fetchArticlesById();
  }, [editDialogOpen, formData.items]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(0);
  };

  // Refresh orders list
  const refreshOrders = async () => {
    if (!vendorId) return;
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
      if (res !== undefined) {
        setOrders(res.items || []);
        setTotal(res.total || 0);
      }
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to refresh orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create Order handlers
  const handleOpenCreate = () => {
    setFormData({
      items: [],
      total: '0.00',
      customerId: `customer-${Date.now()}`,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      vendorId: vendorId || undefined,
    });
    setCreateDialogOpen(true);
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { articleId: '', qty: 1, price: '0.00' }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const newTotal = newItems.reduce((sum, item) => {
        return (parseFloat(sum.toString()) + parseFloat(item.price) * item.qty).toFixed(2);
      }, '0.00');
      return {
        ...prev,
        items: newItems,
        total: newTotal,
      };
    });
  };

  const handleItemChange = (index: number, field: keyof OrderItemDto, value: string | number) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // If articleId changed, update price from article
      if (field === 'articleId' && value) {
        const article = articles.find(a => a.id === value);
        if (article && article.price) {
          newItems[index].price = article.price;
        }
      }
      
      // Recalculate total
      const newTotal = newItems.reduce((sum, item) => {
        return (parseFloat(sum.toString()) + parseFloat(item.price) * item.qty).toFixed(2);
      }, '0.00');
      
      return {
        ...prev,
        items: newItems,
        total: newTotal,
      };
    });
  };

  const handleCreateOrder = async () => {
    if (!formData.items.length || !formData.customerName || !formData.customerEmail) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields and add at least one item',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      await createOrder(formData);
      toast({
        title: 'Success',
        description: 'Order created successfully',
      });
      setCreateDialogOpen(false);
      // Clear cache and refresh
      const { clearCache } = useOrdersStore.getState();
      clearCache();
      await refreshOrders();
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to create order',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // View Order handlers
  const handleViewOrder = async (orderId: string) => {
    try {
      const order = await getOrder(orderId);
      if (order) {
        setSelectedOrder(order);
        setViewDialogOpen(true);
      }
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to load order details',
        variant: 'destructive',
      });
    }
  };

  // Edit Order handlers
  const handleOpenEdit = async (order: Order) => {
    if (order.status !== 'PENDING') {
      toast({
        title: 'Error',
        description: 'Only PENDING orders can be edited',
        variant: 'destructive',
      });
      return;
    }
    setSelectedOrder(order);
    setFormData({
      items: order.items,
      total: order.total,
      customerId: order.customerId || `customer-${Date.now()}`,
      customerName: order.customerName || '',
      customerEmail: order.customerEmail || '',
      customerPhone: order.customerPhone || '',
      customerAddress: order.customerAddress || '',
      vendorId: order.vendorId || vendorId || undefined,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder || !formData.items.length || !formData.customerName || !formData.customerEmail) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields and add at least one item',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      // Exclude customerId from update payload since Order entity doesn't have this field
      const { customerId, ...updateData } = formData;
      await updateOrder(selectedOrder.id, updateData);
      toast({
        title: 'Success',
        description: 'Order updated successfully',
      });
      setEditDialogOpen(false);
      setSelectedOrder(null);
      // Clear cache and refresh
      const { clearCache } = useOrdersStore.getState();
      clearCache();
      await refreshOrders();
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to update order',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Status action handlers
  const handleConfirm = async (orderId: string) => {
    try {
      setActioning(orderId);
      // Get vendorId from the order if available
      const order = orders.find(o => o.id === orderId);
      const idvendor = order?.vendorId || vendorId;
      await confirmOrder(orderId, idvendor);
      toast({
        title: 'Success',
        description: 'Order confirmed successfully',
      });
      await refreshOrders();
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to confirm order',
        variant: 'destructive',
      });
    } finally {
      setActioning(null);
    }
  };

  const handleActivate = async (orderId: string) => {
    try {
      setActioning(orderId);
      await activateOrder(orderId);
      toast({
        title: 'Success',
        description: 'Order activated successfully',
      });
      await refreshOrders();
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to activate order',
        variant: 'destructive',
      });
    } finally {
      setActioning(null);
    }
  };

  const handleDeactivate = async (orderId: string) => {
    try {
      setActioning(orderId);
      await deactivateOrder(orderId);
      toast({
        title: 'Success',
        description: 'Order deactivated successfully',
      });
      await refreshOrders();
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to deactivate order',
        variant: 'destructive',
      });
    } finally {
      setActioning(null);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') => {
    try {
      setActioning(orderId);
      await updateOrderStatus(orderId, newStatus);
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      await refreshOrders();
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setActioning(null);
    }
  };

  const handlePaidChange = async (orderId: string, isPaid: boolean) => {
    try {
      setActioning(orderId);
      await updateOrderPaid(orderId, isPaid);
      toast({
        title: 'Success',
        description: `Order marked as ${isPaid ? 'paid' : 'unpaid'}`,
      });
      await refreshOrders();
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to update payment status',
        variant: 'destructive',
      });
    } finally {
      setActioning(null);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  if (!hydrated || !isAuthenticated || user?.role !== 'vendeur' || !vendorId) return null;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <AnimatedBackground />
      <VendorNavbar />

      <div className="relative z-20 max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">My Orders</h1>
            <p className="text-muted-foreground">View and filter your orders</p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
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
                        <th className="px-4 py-3 text-xs font-medium uppercase text-right">Actions</th>
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
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleStatusChange(order.id, value as 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED')}
                              disabled={actioning === order.id}
                            >
                              <SelectTrigger className={`w-[130px] h-8 ${
                                order.status === 'PENDING'
                                  ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30'
                                  : order.status === 'CONFIRMED'
                                  ? 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
                                  : order.status === 'SHIPPED'
                                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                  : order.status === 'DELIVERED'
                                  ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
                                  : 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
                              }`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">PENDING</SelectItem>
                                <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                                <SelectItem value="SHIPPED">SHIPPED</SelectItem>
                                <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              variant={order.isPaid ? "default" : "outline"}
                              onClick={() => handlePaidChange(order.id, !order.isPaid)}
                              disabled={actioning === order.id}
                              className="w-[100px]"
                            >
                              {actioning === order.id ? (
                                '...'
                              ) : order.isPaid ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Paid
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Unpaid
                                </>
                              )}
                            </Button>
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
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewOrder(order.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {order.status === 'PENDING' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenEdit(order)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {order.status === 'PENDING' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleConfirm(order.id)}
                                  disabled={actioning === order.id}
                                >
                                  {actioning === order.id ? '...' : 'Confirm'}
                                </Button>
                              )}
                              {order.isActive ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeactivate(order.id)}
                                  disabled={actioning === order.id}
                                >
                                  Deactivate
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleActivate(order.id)}
                                  disabled={actioning === order.id}
                                >
                                  Activate
                                </Button>
                              )}
                            </div>
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

      {/* Create Order Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>Add customer information and order items</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="customerAddress">Address</Label>
                  <Textarea
                    id="customerAddress"
                    value={formData.customerAddress || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                    placeholder="123 Main St, City, Country"
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Order Items</h3>
                <Button type="button" size="sm" onClick={handleAddItem} disabled={loadingArticles}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              {loadingArticles ? (
                <p className="text-sm text-muted-foreground">Loading articles...</p>
              ) : formData.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items added. Click "Add Item" to start.</p>
              ) : (
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end p-3 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Label>Article</Label>
                        <Select
                          value={item.articleId}
                          onValueChange={(value) => handleItemChange(index, 'articleId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select article" />
                          </SelectTrigger>
                          <SelectContent>
                            {articles.map((article) => (
                              <SelectItem key={article.id} value={article.id}>
                                {article.title} - {article.price} TND
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24 space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>Price</Label>
                        <Input
                          type="text"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end pt-2 border-t">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{formData.total} TND</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrder} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>View complete order information</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Order Number</Label>
                  <p className="font-semibold">#{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-semibold">{selectedOrder.status}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total</Label>
                  <p className="font-semibold">{selectedOrder.total} TND</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Status</Label>
                  <p className="font-semibold">{selectedOrder.isPaid ? 'Paid' : 'Unpaid'}</p>
                </div>
                {selectedOrder.createdAt && (
                  <div>
                    <Label className="text-muted-foreground">Created At</Label>
                    <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Customer Information</Label>
                <div className="p-3 bg-secondary/50 rounded-lg space-y-1">
                  <p><span className="font-medium">Name:</span> {selectedOrder.customerName || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {selectedOrder.customerEmail || 'N/A'}</p>
                  {selectedOrder.customerPhone && (
                    <p><span className="font-medium">Phone:</span> {selectedOrder.customerPhone}</p>
                  )}
                  {selectedOrder.customerAddress && (
                    <p><span className="font-medium">Address:</span> {selectedOrder.customerAddress}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Order Items</Label>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="p-3 bg-secondary/50 rounded-lg flex justify-between">
                      <div>
                        <p className="font-medium">Article ID: {item.articleId}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.qty} × {item.price} TND</p>
                      </div>
                      <p className="font-semibold">{(parseFloat(item.price) * item.qty).toFixed(2)} TND</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>Update order information (PENDING orders only)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-customerName">Customer Name *</Label>
                  <Input
                    id="edit-customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-customerEmail">Email *</Label>
                  <Input
                    id="edit-customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-customerPhone">Phone</Label>
                  <Input
                    id="edit-customerPhone"
                    value={formData.customerPhone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-customerAddress">Address</Label>
                  <Textarea
                    id="edit-customerAddress"
                    value={formData.customerAddress || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                    placeholder="123 Main St, City, Country"
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Order Items</h3>
                <Button type="button" size="sm" onClick={handleAddItem} disabled={loadingArticles}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              {loadingArticles ? (
                <p className="text-sm text-muted-foreground">Loading articles...</p>
              ) : formData.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items added. Click "Add Item" to start.</p>
              ) : (
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end p-3 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Label>Article</Label>
                        <Select
                          value={item.articleId}
                          onValueChange={(value) => handleItemChange(index, 'articleId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select article" />
                          </SelectTrigger>
                          <SelectContent>
                            {articles.map((article) => (
                              <SelectItem key={article.id} value={article.id}>
                                {article.title} - {article.price} TND
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24 space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>Price</Label>
                        <Input
                          type="text"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end pt-2 border-t">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{formData.total} TND</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrder} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorOrdersPage;

