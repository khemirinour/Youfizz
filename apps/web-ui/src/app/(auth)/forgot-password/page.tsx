'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const ForgotPassword = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email) {
        toast({
          title: t("toast.error"),
          description: t("toast.fillAllFields"),
          variant: "destructive",
        });
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSubmitted(true);
      toast({
        title: t("toast.success"),
        description: t("toast.resetLinkSent"),
      });
    } catch (error) {
      toast({
        title: t("toast.error"),
        description: t("toast.resetLinkFailed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0a0a0a] text-gray-100 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#1a1a1a] opacity-95" />
        <LanguageSwitcher />

        <div className="w-full max-w-md relative z-10 animate-fade-in text-center">
          <div className="rounded-xl p-8 space-y-6 bg-[#1e1e1e]/80 shadow-lg backdrop-blur-md border border-[#2a2a2a]">
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2 text-white">
                {t("forgotPassword.title")}
              </h2>
              <p className="text-gray-400">{t("toast.resetLinkSent")}</p>
            </div>

            <div className="space-y-4 pt-4">
              <Link href="/signin">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-primary text-primary hover:bg-primary/10"
                >
                  {t("forgotPassword.backToSignIn")}
                </Button>
              </Link>

              <button
                onClick={() => setIsSubmitted(false)}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                {t("forgotPassword.sending")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0a0a0a] text-gray-100 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#1a1a1a] opacity-95" />
      <LanguageSwitcher />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <button
            onClick={() => router.push("/signin")}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mb-4"
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

          <h1 className="text-4xl font-bold mb-2 text-white">
            {t("forgotPassword.title")
              .split(" ")
              .slice(0, -1)
              .join(" ")}{" "}
            <span className="text-primary">
            {t("forgotPassword.title").split(" ").slice(-1)}
            </span>
          </h1>
          <p className="text-gray-400">{t("forgotPassword.subtitle")}</p>
        </div>

        <div className="rounded-xl p-8 space-y-6 bg-[#1e1e1e]/80 shadow-lg backdrop-blur-md border border-[#2a2a2a]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                {t("forgotPassword.email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-primary"
                required
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
                ? t("forgotPassword.sending")
                : t("forgotPassword.sendButton")}
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/signin"
              className="text-sm text-gray-400 hover:text-primary transition-colors"
            >
              {t("forgotPassword.backToSignIn")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
