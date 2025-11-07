"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuthStore } from "@/stores/authStore";

const SignUp = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { register, isLoading } = useAuthStore();
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

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t("toast.error"),
        description: t("toast.passwordMismatch"),
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: t("toast.error"),
        description: t("toast.passwordLength"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.role) {
      toast({
        title: t("toast.error"),
        description: t("toast.fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role as "vendeur" | "confirmateur",
      });

      toast({
        title: t("toast.success"),
        description: t("toast.accountCreated"),
      });

      setTimeout(() => router.push("/signin"), 1000);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Account creation failed";
      const description = Array.isArray(message) ? message.join(", ") : message;
      toast({
        title: t("toast.error"),
        description,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 py-12 relative">
      {/* Changer la langue */}
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md relative z-10 bg-neutral-900 p-8 rounded-2xl shadow-lg border border-neutral-800">
        {/* Titre */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">
            {(() => {
              const parts = t("signUp.title").split(" ");
              if (parts.length > 1) {
                const [first, ...rest] = parts;
                return (
                  <>
                    {first}{" "}
                    <span className="text-gradient">{rest.join(" ")}</span>
                  </>
                );
              }
              return t("signUp.title");
            })()}
          </h1>
          <p className="text-gray-400">{t("signUp.subtitle")}</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("signUp.firstName")}</Label>
              <Input
                id="firstName"
                type="text"
                placeholder={t("signUp.firstNamePlaceholder")}
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="h-11 bg-neutral-800 border-neutral-700 text-gray-200 placeholder-gray-400 hover:border-neutral-600 focus:border-orange-500 focus:outline-none focus-visible:ring-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">{t("signUp.lastName")}</Label>
              <Input
                id="lastName"
                type="text"
                placeholder={t("signUp.lastNamePlaceholder")}
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="h-11 bg-neutral-800 border-neutral-700 text-gray-200 placeholder-gray-400 hover:border-neutral-600 focus:border-orange-500 focus:outline-none focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("signUp.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-11 bg-neutral-800 border-neutral-700 text-gray-200 placeholder-gray-400 hover:border-neutral-600 focus:border-orange-500 focus:outline-none focus-visible:ring-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("signUp.password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="h-11 bg-neutral-800 border-neutral-700 text-gray-200 placeholder-gray-400 hover:border-neutral-600 focus:border-orange-500 focus:outline-none focus-visible:ring-0"
            />
            <p className="text-xs text-gray-500">{t("signUp.passwordHint")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("signUp.confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="h-11 bg-neutral-800 border-neutral-700 text-gray-200 placeholder-gray-400 hover:border-neutral-600 focus:border-orange-500 focus:outline-none focus-visible:ring-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t("signUp.role")}</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
              required
            >
              <SelectTrigger className="h-11 bg-neutral-800 border-neutral-700 text-white">
                <SelectValue placeholder={t("signUp.selectRole")} />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
                <SelectItem value="vendeur">{t("signUp.vendeur")}</SelectItem>
                <SelectItem value="confirmateur">{t("signUp.confirmateur")}</SelectItem>
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
            {isLoading ? t("signUp.creating") : t("signUp.createButton")}
          </Button>
        </form>

        <div className="border-t border-neutral-800 my-6" />

        <Link href="/signin">
          <Button
            variant="outline"
            size="lg"
            className="w-full border-neutral-700 text-gray-300 hover:bg-neutral-800"
          >
            {t("signUp.signInLink")}
          </Button>
        </Link>

        <p className="text-center text-xs text-gray-500 mt-6">
          {t("signUp.terms")}
        </p>
      </div>
    </div>
  );
};

export default SignUp;
