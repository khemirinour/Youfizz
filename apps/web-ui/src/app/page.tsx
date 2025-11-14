'use client';

import CTA from "@/components/landing/CTA";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import { ShoppingBag, Sparkles, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

const HomePage = () => {
  const router = useRouter();
  const { t, ready } = useTranslation();
  const [mounted, setMounted] = useState(false);

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


  return (
    <div className="min-h-screen bg-background">

      <PublicNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />


    </div>
  );
};

export default HomePage;
