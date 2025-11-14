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
import AnimatedBackground from "@/components/background/AnimatedBackground";

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

  if (!mounted || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-background text-foreground overflow-hidden">
      <AnimatedBackground />
      <LanguageSwitcher />
      
      <div className="w-full max-w-md relative z-20 animate-fade-in">
        {/* Section titre */}
        <div className="text-center mb-8">
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

        {/* Formulaire de connexion */}
        <div className="card-glass rounded-xl p-8 space-y-6 shadow-[var(--shadow-card)] bg-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t('signIn.email')}</Label>
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

            <div className="space-y-2">
              <Label htmlFor="password">{t('signIn.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-11 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground hover:border-primary/70 focus:border-primary"
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
