'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Order } from '@/lib/orders.api';

interface ViewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrder: Order | null;
}

export default function ViewOrderDialog({
  open,
  onOpenChange,
  selectedOrder,
}: ViewOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <div>
                <Label className="text-muted-foreground">Nombre de tentative</Label>
                <p className="font-semibold">{selectedOrder.confirmationAttempts || 0}</p>
              </div>
              {selectedOrder.lastConfirmationAttemptAt && (
                <div>
                  <Label className="text-muted-foreground">Last Attempt At</Label>
                  <p className="font-semibold">{new Date(selectedOrder.lastConfirmationAttemptAt).toLocaleString()}</p>
                </div>
              )}
            </div>
            {selectedOrder.confirmedByUserName || selectedOrder.confirmedByUserEmail ? (
              <div className="space-y-2">
                <Label className="text-muted-foreground">User qui confirme</Label>
                <div className="p-3 bg-secondary/50 rounded-lg space-y-1">
                  {selectedOrder.confirmedByUserName && (
                    <p>
                      <span className="font-medium">Name:</span>{' '}
                      <span>{selectedOrder.confirmedByUserName}</span>
                    </p>
                  )}
                  {selectedOrder.confirmedByUserEmail && (
                    <p>
                      <span className="font-medium">Email:</span>{' '}
                      <span>{selectedOrder.confirmedByUserEmail}</span>
                    </p>
                  )}
                  {selectedOrder.confirmedByUserId && (
                    <p>
                      <span className="font-medium">User ID:</span>{' '}
                      <span className="text-xs text-muted-foreground">{selectedOrder.confirmedByUserId}</span>
                    </p>
                  )}
                </div>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Customer Information</Label>
              <div className="p-3 bg-secondary/50 rounded-lg space-y-1">
                {(() => {
                  const isHidden = !selectedOrder.customerName && !selectedOrder.customerEmail;
                  const fakeName = 'John Doe';
                  const fakeEmail = 'customer@example.com';
                  const fakePhone = '+216 12 345 678';
                  const fakeAddress = '123 Main Street, Tunis, Tunisia';
                  
                  return (
                    <>
                      <p>
                        <span className="font-medium">Name:</span>{' '}
                        <span className={isHidden ? 'blur-sm select-none' : ''}>
                          {selectedOrder.customerName || fakeName}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{' '}
                        <span className={isHidden ? 'blur-sm select-none' : ''}>
                          {selectedOrder.customerEmail || fakeEmail}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span>{' '}
                        <span className={isHidden ? 'blur-sm select-none' : ''}>
                          {selectedOrder.customerPhone || fakePhone}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Address:</span>{' '}
                        <span className={isHidden ? 'blur-sm select-none' : ''}>
                          {selectedOrder.customerAddress || fakeAddress}
                        </span>
                      </p>
                      {selectedOrder.remarque && (
                        <p>
                          <span className="font-medium">Remarks:</span>{' '}
                          <span className={isHidden ? 'blur-sm select-none' : ''}>
                            {selectedOrder.remarque}
                          </span>
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Order Items</Label>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="p-4 bg-secondary/50 rounded-lg border">
                    <div className="flex gap-4">
                      {/* Article Image */}
                      {item.article?.images && item.article.images.length > 0 && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.article.images[0]}
                            alt={item.article.title || 'Article image'}
                            className="w-20 h-20 object-cover rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      {/* Article Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-base">
                              {item.article?.title || `Article ID: ${item.articleId}`}
                            </p>
                            {item.article?.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {item.article.description}
                              </p>
                            )}
                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                              {item.article?.sku && (
                                <span>SKU: {item.article.sku}</span>
                              )}
                              <span>Qty: {item.qty}</span>
                              <span>Price: {item.price} TND</span>
                            </div>
                            {item.hasDelivery && (
                              <div className="mt-2 flex gap-2 items-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  With Delivery
                                </span>
                                {item.destination && (
                                  <span className="text-sm text-muted-foreground">
                                    To: {item.destination}
                                  </span>
                                )}
                                {item.deliveryPrice && (
                                  <span className="text-sm text-muted-foreground">
                                    ({item.deliveryPrice} TND/item)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">
                              {(() => {
                                const itemTotal = parseFloat(item.price) * item.qty;
                                const deliveryTotal = item.hasDelivery && item.deliveryPrice
                                  ? parseFloat(item.deliveryPrice) * 1
                                  : 0;
                                return (itemTotal + deliveryTotal).toFixed(2);
                              })} TND
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.qty} × {item.price} TND
                              {item.hasDelivery && item.deliveryPrice && (
                                <>
                                  <br />
                                  + {item.deliveryPrice} TND (delivery)
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

