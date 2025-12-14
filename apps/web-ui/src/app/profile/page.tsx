'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { getProfile, updateProfile } from '@/lib/profile.api';
import AnimatedBackground from '@/components/background/AnimatedBackground';
import { Badge } from '@/components/ui/badge';
import PublicNavbar from '@/components/PublicNavbar';

const ProfilePage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [role, setRole] = useState<'vendeur' | 'confermateur' | 'admin'>('vendeur');

  // Wait for Zustand persist hydration
  useEffect(() => {
    const api = (useAuthStore as any).persist;
    if (api?.hasHydrated?.()) setHydrated(true);
    const unsub = api?.onFinishHydration?.(() => setHydrated(true));
    return () => unsub?.();
  }, []);

  // Verify authentication and redirect if not authenticated
  useEffect(() => {
    if (!hydrated) return;
    
    if (!isAuthenticated || !user) {
      router.replace('/signin');
      return;
    }

    // Load profile data using auth service
    const loadProfile = async () => {
      try {
        setLoading(true);
        // Use auth service to get user by ID
        const profile = await getProfile(user.id);
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
        });
        setRole(profile.role);
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Failed to load profile';
        toast({
          title: 'Error',
          description: Array.isArray(message) ? message.join(', ') : message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [hydrated, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      // Pass user.id as first parameter to updateProfile
      const updated = await updateProfile(user!.id, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
      });

      // Update auth store with new user data
      if (user) {
        updateUser({
          id: user.id,
          firstName: updated.firstName || '',
          lastName: updated.lastName || '',
          email: updated.email,
        });
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to update profile';
      const description = Array.isArray(message) ? message.join(', ') : message;
      toast({
        title: 'Error',
        description,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'vendeur':
        return 'Vendeur';
      case 'confermateur':
        return 'Confermateur';
      default:
        return role;
    }
  };

  const getRoleVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'vendeur':
        return 'default';
      case 'confermateur':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <AnimatedBackground />
      <PublicNavbar />
      
      <div className="relative z-20 container mx-auto px-4 py-12 max-w-2xl">
        <div className="card-glass rounded-xl p-8 shadow-lg border border-border bg-card">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gradient">Profile</span>
            </h1>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Display (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleVariant(role)} className="h-11 px-4 flex items-center">
                    {getRoleLabel(role)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Role cannot be changed
                  </p>
                </div>
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="h-11 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground hover:border-primary/70 focus:border-primary"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="h-11 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground hover:border-primary/70 focus:border-primary"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground hover:border-primary/70 focus:border-primary"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
