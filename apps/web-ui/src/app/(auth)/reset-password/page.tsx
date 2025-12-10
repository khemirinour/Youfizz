'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AnimatedBackground from "@/components/background/AnimatedBackground";
import { apiConfirmPasswordReset, apiResetPassword } from "@/lib/auth.api";

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);

  useEffect(() => {
    // Prevent multiple validations
    if (hasValidated) return;
    
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setIsValidating(false);
      setIsValid(false);
      setHasValidated(true);
      toast({
        title: t("toast.error"),
        description: "Invalid reset link. Please request a new password reset.",
        variant: "destructive",
      });
      return;
    }

    setToken(tokenParam);
    setHasValidated(true);
    validateToken(tokenParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only depend on searchParams, not t

  const validateToken = async (tokenValue: string) => {
    try {
      const response = await apiConfirmPasswordReset(tokenValue);
      if (response.isValid) {
        setIsValid(true);
        setEmail(response.email || null);
      } else {
        setIsValid(false);
        toast({
          title: t("toast.error"),
          description: response.message || "Invalid or expired reset token",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setIsValid(false);
      // Handle rate limit errors specifically
      if (error?.response?.status === 429) {
        toast({
          title: t("toast.error"),
          description: "Too many requests. Please wait a moment and refresh the page.",
          variant: "destructive",
        });
      } else {
        toast({
          title: t("toast.error"),
          description: error?.response?.data?.message || error?.message || "Failed to validate reset token",
          variant: "destructive",
        });
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: t("toast.error"),
        description: t("toast.fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: t("toast.error"),
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: t("toast.error"),
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: t("toast.error"),
        description: "Invalid reset token",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiResetPassword(token, password);
      setIsSuccess(true);
      toast({
        title: t("toast.success"),
        description: "Password has been reset successfully",
      });
      
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (error: any) {
      toast({
        title: t("toast.error"),
        description: error?.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-background text-foreground overflow-hidden">
        <AnimatedBackground />
        <LanguageSwitcher />
        <div className="w-full max-w-md relative z-20 animate-fade-in text-center">
          <div className="card-glass rounded-xl p-8 space-y-6 bg-card shadow-[var(--shadow-card)] border border-border">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Validating reset token...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-background text-foreground overflow-hidden">
        <AnimatedBackground />
        <LanguageSwitcher />
        <div className="w-full max-w-md relative z-20 animate-fade-in text-center">
          <div className="card-glass rounded-xl p-8 space-y-6 bg-card shadow-[var(--shadow-card)] border border-border">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                Invalid Reset Link
              </h2>
              <p className="text-muted-foreground mb-4">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
            </div>
            <div className="space-y-4 pt-4">
              <Link href="/forgot-password">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                >
                  Request New Reset Link
                </Button>
              </Link>
              <Link href="/signin">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-primary text-primary hover:bg-primary/10"
                >
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-background text-foreground overflow-hidden">
        <AnimatedBackground />
        <LanguageSwitcher />
        <div className="w-full max-w-md relative z-20 animate-fade-in text-center">
          <div className="card-glass rounded-xl p-8 space-y-6 bg-card shadow-[var(--shadow-card)] border border-border">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                Password Reset Successful
              </h2>
              <p className="text-muted-foreground">
                Your password has been reset successfully. Redirecting to sign in...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-background text-foreground overflow-hidden">
      <AnimatedBackground />
      <LanguageSwitcher />

      <div className="w-full max-w-md relative z-20 animate-fade-in">
        <div className="text-center mb-8">
          <button
            onClick={() => router.push("/signin")}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t("forgotPassword.backToSignIn")}
          </button>

          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Reset Your{" "}
            <span className="text-primary">Password</span>
          </h1>
          {email && (
            <p className="text-muted-foreground">
              Reset password for {email}
            </p>
          )}
        </div>

        <div className="card-glass rounded-xl p-8 space-y-6 bg-card shadow-[var(--shadow-card)] border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                required
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading
                ? "Resetting Password..."
                : "Reset Password"}
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/signin"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

