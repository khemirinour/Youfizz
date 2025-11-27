'use client';

import PublicNavbar from '@/components/PublicNavbar';
import AnimatedBackground from '@/components/background/AnimatedBackground';
import Footer from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Mail, MessageCircle, FileText } from 'lucide-react';

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <PublicNavbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Support</h1>
          <p className="text-muted-foreground">We're here to help you</p>
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-6 w-6 text-primary" />
                <CardTitle>Email Support</CardTitle>
              </div>
              <CardDescription>
                Send us an email and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                support@youfizz.com
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                <CardTitle>Live Chat</CardTitle>
              </div>
              <CardDescription>
                Chat with our support team in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Available Monday - Friday, 9 AM - 5 PM
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle>Help Center</CardTitle>
              </div>
              <CardDescription>
                Browse our knowledge base for answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Coming soon
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                <CardTitle>FAQs</CardTitle>
              </div>
              <CardDescription>
                Find answers to frequently asked questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Coming soon
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
            <CardDescription>
              Our support team is ready to assist you with any questions or concerns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you can't find what you're looking for, don't hesitate to reach out to us. 
              We're committed to providing you with the best possible support experience.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default SupportPage;

