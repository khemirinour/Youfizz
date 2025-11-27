'use client';

import PublicNavbar from '@/components/PublicNavbar';
import AnimatedBackground from '@/components/background/AnimatedBackground';
import Footer from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const BlogsPage = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <PublicNavbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Blogs</h1>
          <p className="text-muted-foreground">Stay updated with our latest news and articles</p>
        </div>

        {/* Placeholder Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <CardTitle>Coming Soon</CardTitle>
            </div>
            <CardDescription>
              Our blog section is currently under development. Check back soon for exciting content!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We're working hard to bring you valuable articles, tips, and updates. 
              Stay tuned for our upcoming blog posts!
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default BlogsPage;

