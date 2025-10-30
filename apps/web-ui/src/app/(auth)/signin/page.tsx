'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuthStore } from "@/stores/authStore";

const SignIn = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { t, ready } = useTranslation();
  const { login, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during hydration
  if (!mounted || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.email || !formData.password) {
      toast({
        title: t('toast.error'),
        description: t('toast.fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    try {
      await login(formData.email, formData.password);

      toast({
        title: t('toast.success'),
        description: t('toast.signInSuccess'),
      });

      router.push("/");
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Sign in failed';
      const description = Array.isArray(message) ? message.join(', ') : message;
      toast({
        title: t('toast.error'),
        description,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 z-0" style={{ background: 'var(--gradient-radial)' }} />
      <LanguageSwitcher />
      
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo/Back button */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('signIn.backHome')}
          </button>
          <h1 className="text-4xl font-bold mb-2">
            {(() => {
              const parts = t('signIn.title').split(' ');
              if (parts.length > 1) {
                const [first, ...rest] = parts;
                return (
                  <>
                    {first} <span className="text-gradient">{rest.join(' ')}</span>
                  </>
                );
              }
              return t('signIn.title');
            })()}
          </h1>
          <p className="text-muted-foreground">{t('signIn.subtitle')}</p>
        </div>

        {/* Sign In Form */}
        <div className="card-glass rounded-xl p-8 space-y-6 shadow-[var(--shadow-card)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t('signIn.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11 bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('signIn.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-11 bg-input border-border"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, rememberMe: checked as boolean })
                  }
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  {t('signIn.rememberMe')}
                </Label>
              </div>

              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {t('signIn.forgotPassword')}
              </Link>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? t('signIn.signingIn') : t('signIn.signInButton')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">
                {t('signIn.noAccount')}
              </span>
            </div>
          </div>

          <Link href="/signup">
            <Button variant="outline" size="lg" className="w-full">
              {t('signIn.signUpLink')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
