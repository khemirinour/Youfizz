'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import { getArticleById, type Article } from '@/lib/articles.api';
import { createOrder, type CreateOrderDto, type OrderItemDto } from '@/lib/orders.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSeoMeta } from '@/hooks/use-seo-meta';
import { getArticleUrl } from '@/lib/utils/url';
import { ArrowLeft, ShoppingBag, Package, ShoppingCart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import Link from 'next/link';

const ArticleDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Order form state
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [remarque, setRemarque] = useState('');
  const [hasDelivery, setHasDelivery] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const articleId = params.id as string;

  // Helper function to calculate discount percentage
  const calculateDiscountPercentage = (price: string | undefined, priceAfterDiscount?: string): number | null => {
    if (!priceAfterDiscount || !price) return null;
    const originalPrice = parseFloat(price);
    const discountedPrice = parseFloat(priceAfterDiscount);
    if (originalPrice <= 0 || discountedPrice >= originalPrice) return null;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;
      
      try {
        setLoading(true);
        const data = await getArticleById(articleId);
        setArticle(data || null);
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e?.response?.data?.message || e?.message || 'Failed to load article',
          variant: 'destructive',
        });
        router.push('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]); // Remove router and toast from dependencies

  // Automatically enable delivery if article has delivery options
  useEffect(() => {
    if (article?.deliveryRegions && article.deliveryRegions.length > 0) {
      setHasDelivery(true);
      // Auto-select first destination if only one is available
      if (article.deliveryRegions.length === 1) {
        setSelectedDestination(article.deliveryRegions[0]);
      }
    }
  }, [article]);

  // Update SEO meta tags when article is loaded
  useSeoMeta(
    article
      ? {
          title: article.title,
          description: article.description || article.title,
          image: article.images?.[0],
          url: getArticleUrl(article.id),
          type: 'product',
          siteName: 'YouFizz',
        }
      : null
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Article Not Found</CardTitle>
              <CardDescription>The article you're looking for doesn't exist.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/shop">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Shop
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const images = article.images || [];
  const mainImage = images[selectedImageIndex] || images[0];

  // Generate customerId for guest orders
  const generateCustomerId = () => {
    if (typeof window !== 'undefined' && window.crypto) {
      return crypto.randomUUID();
    }
    // Fallback for environments without crypto
    return `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Calculate total - use discounted price if available, include delivery if selected
  const calculateTotal = () => {
    if (!article?.price) return '0.00';
    const priceToUse = article.priceAfterDiscount ? parseFloat(article.priceAfterDiscount) : parseFloat(article.price);
    let total = priceToUse * quantity;
    
    // Add delivery price if article has delivery options and destination is selected
    // Delivery is per order (not per item), so multiply by 1
    if (article.deliveryRegions && article.deliveryRegions.length > 0 && selectedDestination && article.deliveryPrices?.[selectedDestination]) {
      const deliveryPrice = parseFloat(article.deliveryPrices[selectedDestination]);
      total += deliveryPrice * 1;
    }
    
    return total.toFixed(2);
  };

  // Get the effective price (discounted or regular)
  const getEffectivePrice = () => {
    if (!article?.price) return '';
    return article.priceAfterDiscount || article.price;
  };

  // Validate form
  const isFormValid = () => {
    if (!customerName.trim() || !customerEmail.trim()) return false;
    if (quantity < 1) return false;
    if (typeof article.stock === 'number' && quantity > article.stock) return false;
    if (!article.price) return false;
    // If article has delivery, destination must be selected
    if (article.deliveryRegions && article.deliveryRegions.length > 0) {
      if (!selectedDestination) return false;
    }
    return true;
  };

  // Handle order submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!article || !isFormValid()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      
      if (!article.price) {
        toast({
          title: 'Error',
          description: 'Product price is not available',
          variant: 'destructive',
        });
        return;
      }

      // Use discounted price if available, otherwise use regular price
      const effectivePrice = article.priceAfterDiscount || article.price;
      
      const orderItem: OrderItemDto = {
        articleId: article.id,
        qty: quantity,
        price: effectivePrice,
      };
      
      // Add delivery information if article has delivery options
      if (article.deliveryRegions && article.deliveryRegions.length > 0 && selectedDestination && article.deliveryPrices?.[selectedDestination]) {
        orderItem.hasDelivery = true;
        orderItem.destination = selectedDestination;
        orderItem.deliveryPrice = article.deliveryPrices[selectedDestination];
      }
      
      const orderData: CreateOrderDto = {
        items: [orderItem],
        total: calculateTotal(),
        customerId: generateCustomerId(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        vendorId: article.vendorId || undefined,
        remarque: remarque.trim() || undefined,
      };

      const createdOrder = await createOrder(orderData);
      
      if (!createdOrder) {
        toast({
          title: 'Error',
          description: 'Failed to place order. Please try again.',
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Order Placed Successfully!',
        description: `Your order #${createdOrder.orderNumber} has been placed. We'll contact you soon.`,
      });

      // Reset form
      setQuantity(1);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerAddress('');
      setRemarque('');
      // Reset delivery based on article
      if (article.deliveryRegions && article.deliveryRegions.length > 0) {
        setHasDelivery(true);
        setSelectedDestination(article.deliveryRegions.length === 1 ? article.deliveryRegions[0] : '');
      } else {
        setHasDelivery(false);
        setSelectedDestination('');
      }
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.response?.data?.message || e?.message || 'Failed to place order',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/shop">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
              {mainImage ? (
                <>
                  <Image
                    src={mainImage}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  {(() => {
                    const discountPercent = calculateDiscountPercentage(article.price, article.priceAfterDiscount);
                    return discountPercent !== null && discountPercent > 0 ? (
                      <div className="absolute top-4 right-4 z-10 bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-bold shadow-lg">
                        -{discountPercent}%
                      </div>
                    ) : null;
                  })()}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-full h-20 bg-muted rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${article.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Article Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{article.title}</h1>
              {article.description && (
                <p className="text-lg text-muted-foreground">{article.description}</p>
              )}
            </div>

            {article.price && (() => {
              const discountPercent = calculateDiscountPercentage(article.price, article.priceAfterDiscount);
              const hasDiscount = discountPercent !== null && discountPercent > 0;
              
              return (
                <div className="space-y-2">
                  {hasDiscount && article.priceAfterDiscount ? (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-bold text-primary">
                          ${article.priceAfterDiscount}
                        </span>
                        {discountPercent !== null && (
                          <span className="px-3 py-1 bg-red-500 text-white rounded-md text-sm font-bold">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl text-muted-foreground line-through">
                          ${article.price}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-4xl font-bold text-primary">
                      ${article.price}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Stock Information */}
            {typeof article.stock === 'number' && (
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <span className={article.stock > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {article.stock > 0 ? `${article.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            )}

            {/* SKU */}
            {article.sku && (
              <div className="text-sm text-muted-foreground">
                SKU: {article.sku}
              </div>
            )}

            {/* Categories */}
            {article.categories && article.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Catégories:</span>
                {article.categories.map((category) => (
                  <span
                    key={category.id}
                    className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}

            {/* Specifications */}
            {article.specifications && Object.keys(article.specifications).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Spécifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(article.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b last:border-0">
                        <span className="text-muted-foreground font-medium capitalize">{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {article.status && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium capitalize">{article.status.toLowerCase()}</span>
                  </div>
                )}
                {article.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Added:</span>
                    <span className="font-medium">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            {article.metadata && Object.keys(article.metadata).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(article.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Place Order
                </CardTitle>
                <CardDescription>
                  Fill in your information to place an order for this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                {typeof article.stock === 'number' && article.stock === 0 ? (
                  <div className="text-center py-6">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-lg font-semibold text-red-600">Out of Stock</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This product is currently unavailable
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitOrder} className="space-y-4">
                    {/* Quantity */}
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min={1}
                        max={typeof article.stock === 'number' ? article.stock : undefined}
                        value={quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          const maxQty = typeof article.stock === 'number' ? article.stock : Infinity;
                          setQuantity(Math.min(Math.max(1, value), maxQty));
                        }}
                        required
                        disabled={submitting}
                      />
                      {typeof article.stock === 'number' && (
                        <p className="text-xs text-muted-foreground">
                          Maximum {article.stock} available
                        </p>
                      )}
                    </div>

                    {/* Delivery Selection */}
                    {article.deliveryRegions && article.deliveryRegions.length > 0 && (
                      <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                        <div className="space-y-2">
                          <Label htmlFor="destination">Delivery Destination *</Label>
                          <Select
                            value={selectedDestination}
                            onValueChange={setSelectedDestination}
                            disabled={submitting}
                            required
                          >
                            <SelectTrigger id="destination">
                              <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                            <SelectContent>
                              {article.deliveryRegions.map((region) => (
                                <SelectItem key={region} value={region}>
                                  {region}
                                  {article.deliveryPrices?.[region] && (
                                    <span className="ml-2 text-muted-foreground">
                                      (${article.deliveryPrices[region]})
                                    </span>
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedDestination && article.deliveryPrices?.[selectedDestination] && (
                            <p className="text-sm text-muted-foreground">
                              Delivery price: ${article.deliveryPrices[selectedDestination]} per item
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Customer Name */}
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Full Name *</Label>
                      <Input
                        id="customerName"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        disabled={submitting}
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Customer Email */}
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Email *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                        disabled={submitting}
                        placeholder="john@example.com"
                      />
                    </div>

                    {/* Customer Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Phone Number</Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        disabled={submitting}
                        placeholder="+1 234 567 8900"
                      />
                    </div>

                    {/* Customer Address */}
                    <div className="space-y-2">
                      <Label htmlFor="customerAddress">Delivery Address</Label>
                      <Textarea
                        id="customerAddress"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        disabled={submitting}
                        placeholder="123 Main St, City, State, ZIP"
                        rows={3}
                      />
                    </div>

                    {/* Customer Remarks */}
                    <div className="space-y-2">
                      <Label htmlFor="remarque">Remarks / Notes</Label>
                      <Textarea
                        id="remarque"
                        value={remarque}
                        onChange={(e) => setRemarque(e.target.value)}
                        disabled={submitting}
                        placeholder="Any additional notes or special instructions..."
                        rows={3}
                      />
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">
                          ${(() => {
                            if (!article?.price) return '0.00';
                            const priceToUse = article.priceAfterDiscount ? parseFloat(article.priceAfterDiscount) : parseFloat(article.price);
                            return (priceToUse * quantity).toFixed(2);
                          })()}
                        </span>
                      </div>
                      {article.deliveryRegions && article.deliveryRegions.length > 0 && selectedDestination && article.deliveryPrices?.[selectedDestination] && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Delivery:</span>
                          <span className="font-medium">
                            ${(parseFloat(article.deliveryPrices[selectedDestination]) * 1).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-primary">
                          ${calculateTotal()}
                        </span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={!isFormValid() || submitting || (typeof article.stock === 'number' && article.stock === 0)}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Place Order
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;

