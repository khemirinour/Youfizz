'use client';

import { Button } from "@/components/ui/button";
import { ShoppingCart, TrendingUp, Users, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import logo from "@/assets/youfizz-logo-text.png";
import AnimatedBackground from "@/components/background/AnimatedBackground";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      
      <AnimatedBackground />

      <div className="container mx-auto px-4 relative z-10 flex-1 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          {/* Logo YouFizz */}
          <div className="mb-8 flex justify-center">
            <div className="relative group">
              {/* Glow effect dynamique derrière le logo */}
              <div className="absolute inset-0 bg-primary/20 blur-[60px] scale-125 animate-glow" />
              <img 
                src={logo.src || logo} 
                alt="YouFizz Company" 
                className="h-56 md:h-72 lg:h-96 w-auto relative z-10 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_30px_rgba(255,119,51,0.45)]"
                style={{ animation: "float 5s ease-in-out infinite" }}
              />
            </div>
          </div>

          {/* Tagline */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
            Votre compagnie <span className="text-primary">nouvelle génération</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Découvrez une expérience de commerce en ligne révolutionnaire. 
            Achetez, vendez et développez votre activité en toute simplicité.
          </p>

          {/* CTA Button */}
            <div className="flex justify-center gap-4 mb-16">
              <Link href="/shop">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-12 py-6 animate-glow">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Browse Shop
                </Button>
              </Link>
              <Link href="/signin">
                <Button variant="outline" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-12 py-6 animate-glow">
                  Sign In
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300">
              <Users className="h-10 w-10 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-2">10K+</div>
              <div className="text-muted-foreground">Vendeurs actifs</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300">
              <ShoppingCart className="h-10 w-10 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-2">50K+</div>
              <div className="text-muted-foreground">Produits en ligne</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300">
              <TrendingUp className="h-10 w-10 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-2">98%</div>
              <div className="text-muted-foreground">Satisfaction client</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
