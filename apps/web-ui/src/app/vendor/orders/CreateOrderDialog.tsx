'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import type { CreateOrderDto, OrderItemDto } from '@/lib/orders.api';
import type { Article } from '@/lib/articles.api';

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CreateOrderDto;
  setFormData: React.Dispatch<React.SetStateAction<CreateOrderDto>>;
  articles: Article[];
  loadingArticles: boolean;
  submitting: boolean;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onItemChange: (index: number, field: keyof OrderItemDto, value: string | number | boolean) => void;
  onCreateOrder: () => Promise<void>;
}

export default function CreateOrderDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  articles,
  loadingArticles,
  submitting,
  onAddItem,
  onRemoveItem,
  onItemChange,
  onCreateOrder,
}: CreateOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <div className="space-y-2 col-span-2">
                <Label htmlFor="remarque">Remarks / Notes</Label>
                <Textarea
                  id="remarque"
                  value={formData.remarque || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarque: e.target.value }))}
                  placeholder="Any additional notes or special instructions..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Order Items</h3>
              <Button type="button" size="sm" onClick={onAddItem} disabled={loadingArticles}>
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
                  <div key={index} className="space-y-2">
                    <div className="flex gap-2 items-end p-3 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Label>Article</Label>
                        <Select
                          value={item.articleId}
                          onValueChange={(value) => onItemChange(index, 'articleId', value)}
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
                          onChange={(e) => onItemChange(index, 'qty', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>Price</Label>
                        <Input
                          type="text"
                          value={item.price}
                          onChange={(e) => onItemChange(index, 'price', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Delivery Configuration */}
                    {(() => {
                      const article = articles.find(a => a.id === item.articleId);
                      const hasDeliveryRegions = article?.deliveryRegions && article.deliveryRegions.length > 0;
                      
                      if (!hasDeliveryRegions) return null;
                      
                      return (
                        <div className="mt-2 p-3 border rounded-lg bg-muted/30 space-y-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`create-delivery-${index}`}
                              checked={item.hasDelivery || false}
                              onCheckedChange={(checked) => {
                                onItemChange(index, 'hasDelivery', checked);
                                if (checked && article?.deliveryRegions && article.deliveryRegions.length > 0) {
                                  onItemChange(index, 'destination', article.deliveryRegions[0]);
                                }
                              }}
                            />
                            <Label htmlFor={`create-delivery-${index}`} className="cursor-pointer">
                              Include Delivery
                            </Label>
                          </div>
                          
                          {item.hasDelivery && article?.deliveryRegions && (
                            <div className="space-y-2">
                              <Label htmlFor={`create-destination-${index}`}>Delivery Destination</Label>
                              <Select
                                value={item.destination || ''}
                                onValueChange={(value) => onItemChange(index, 'destination', value)}
                              >
                                <SelectTrigger id={`create-destination-${index}`}>
                                  <SelectValue placeholder="Select destination" />
                                </SelectTrigger>
                                <SelectContent>
                                  {article.deliveryRegions.map((region) => (
                                    <SelectItem key={region} value={region}>
                                      {region}
                                      {article.deliveryPrices?.[region] && (
                                        <span className="ml-2 text-muted-foreground">
                                          ({article.deliveryPrices[region]} TND)
                                        </span>
                                      )}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {item.destination && article.deliveryPrices?.[item.destination] && (
                                <p className="text-xs text-muted-foreground">
                                  Delivery price: {article.deliveryPrices[item.destination]} TND per item
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-2 border-t">
              <div className="text-right space-y-1">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">
                    {(() => {
                      const subtotal = formData.items.reduce((sum, item) => {
                        return sum + parseFloat(item.price) * item.qty;
                      }, 0);
                      return subtotal.toFixed(2);
                    })()} TND
                  </span>
                </div>
                {formData.items.some(item => item.hasDelivery && item.deliveryPrice) && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">Delivery:</span>
                    <span className="font-medium">
                      {(() => {
                        const deliveryTotal = formData.items.reduce((sum, item) => {
                          if (item.hasDelivery && item.deliveryPrice) {
                            return sum + parseFloat(item.deliveryPrice) * item.qty;
                          }
                          return sum;
                        }, 0);
                        return deliveryTotal.toFixed(2);
                      })()} TND
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4 pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className="text-2xl font-bold">{formData.total} TND</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onCreateOrder} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

