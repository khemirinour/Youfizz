import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t('toast.error'),
        description: t('toast.passwordMismatch'),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      toast({
        title: t('toast.error'),
        description: t('toast.passwordLength'),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Simulate API call - Replace with actual API call to POST /api/register
    try {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.role) {
        toast({
          title: t('toast.error'),
          description: t('toast.fillAllFields'),
          variant: "destructive",
        });
        return;
      }

      // Prepare data for API call
      const registerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      console.log('Register data:', registerData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: t('toast.success'),
        description: t('toast.accountCreated'),
      });

      // Navigate to sign in page after successful registration
      setTimeout(() => {
        navigate("/signin");
      }, 1000);
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('toast.accountFailed'),
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
            {t('signUp.backHome')}
          </button>
          <h1 className="text-4xl font-bold mb-2">
            {t('signUp.title').split(' ')[0]} <span className="text-gradient">{t('signUp.title').split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-muted-foreground">{t('signUp.subtitle')}</p>
        </div>

        {/* Sign Up Form */}
        <div className="card-glass rounded-xl p-8 space-y-6 shadow-[var(--shadow-card)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('signUp.firstName')}</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder={t('signUp.firstNamePlaceholder')}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="h-11 bg-input border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">{t('signUp.lastName')}</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder={t('signUp.lastNamePlaceholder')}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="h-11 bg-input border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('signUp.email')}</Label>
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
              <Label htmlFor="password">{t('signUp.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-11 bg-input border-border"
                required
              />
              <p className="text-xs text-muted-foreground">
                {t('signUp.passwordHint')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('signUp.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="h-11 bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{t('signUp.role')}</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                required
              >
                <SelectTrigger className="h-11 bg-input border-border">
                  <SelectValue placeholder={t('signUp.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendeur">{t('signUp.vendeur')}</SelectItem>
                  <SelectItem value="confirmateur">{t('signUp.confirmateur')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? t('signUp.creating') : t('signUp.createButton')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">
                {t('signUp.haveAccount')}
              </span>
            </div>
          </div>

          <Link to="/signin">
            <Button variant="outline" size="lg" className="w-full">
              {t('signUp.signInLink')}
            </Button>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {t('signUp.terms')}
        </p>
      </div>
    </div>
  );
};

export default SignUp;
