'use client';

import { Button } from "@/components/ui/button";
import { ShoppingCart, TrendingUp, Users, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/youfizz-logo-text.png";
import AnimatedBackground from "@/components/background/AnimatedBackground";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      
      <AnimatedBackground />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10 flex-1 flex items-center justify-center py-12 sm:py-16 md:py-20">
        <div className="text-center animate-fade-in w-full">
          {/* Logo YouFizz */}
          <div className="mb-6 sm:mb-8 flex justify-center">
            <div className="relative group">
              {/* Glow effect dynamique derrière le logo */}
              <div className="absolute inset-0 bg-primary/40 blur-[60px] sm:blur-[80px] scale-125 animate-glow" />
              <Image 
                src={logo}
                alt="YouFizz Marketplace" 
                className="h-40 sm:h-56 md:h-72 lg:h-96 w-auto relative z-10 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_40px_rgba(255,119,51,0.6)]"
                style={{ animation: "float 5s ease-in-out infinite", height: 'auto', width: 'auto' }}
                priority
              />
            </div>
          </div>

          {/* Tagline */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-foreground px-2">
            Votre marketplace <span className="text-primary">nouvelle génération</span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto px-4">
            Découvrez une expérience de commerce en ligne révolutionnaire. 
            Achetez, vendez et développez votre activité en toute simplicité.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-14 md:mb-16 px-4">
            <Link href="/shop" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-base sm:text-lg px-8 sm:px-10 md:px-12 py-6 sm:py-6 md:py-7 "
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Browse Shop
              </Button>
            </Link>
            <Link href="/signin" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-base sm:text-lg px-8 sm:px-10 md:px-12 py-6 sm:py-6 md:py-7 "
              >
                Sign In
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto px-4">
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-primary/50 transition-all duration-300">
              <Users className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-2 sm:mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">10K+</div>
              <div className="text-sm sm:text-base text-muted-foreground">Vendeurs actifs</div>
            </div>
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-primary/50 transition-all duration-300">
              <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-2 sm:mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">50K+</div>
              <div className="text-sm sm:text-base text-muted-foreground">Produits en ligne</div>
            </div>
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-primary/50 transition-all duration-300">
              <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-2 sm:mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">98%</div>
              <div className="text-sm sm:text-base text-muted-foreground">Satisfaction client</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
