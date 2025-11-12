'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import { getArticleById, type Article } from '@/lib/articles.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShoppingBag, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const ArticleDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const articleId = params.id as string;

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;
      
      try {
        setLoading(true);
        const data = await getArticleById(articleId);
        setArticle(data);
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
  }, [articleId, router, toast]);

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
                <Image
                  src={mainImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
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

            {article.price && (
              <div className="text-4xl font-bold text-primary">
                ${article.price}
              </div>
            )}

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;

