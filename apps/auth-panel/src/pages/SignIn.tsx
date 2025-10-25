import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call - Replace with actual API call to POST /api/login
    try {
      // Mock validation
      if (!formData.email || !formData.password) {
        toast({
          title: t('toast.error'),
          description: t('toast.fillAllFields'),
          variant: "destructive",
        });
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: t('toast.success'),
        description: t('toast.signInSuccess'),
      });

      // Navigate to home or dashboard after successful login
      navigate("/");
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('toast.signInFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('signIn.backHome')}
          </button>
          <h1 className="text-4xl font-bold mb-2">
            {t('signIn.title').split(' ')[0]} <span className="text-gradient">{t('signIn.title').split(' ').slice(1).join(' ') || 'Back'}</span>
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
                to="/forgot-password"
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

          <Link to="/signup">
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
