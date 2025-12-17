'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5 relative overflow-hidden">
      {/* Decorative elements - hidden on mobile */}
      <div className="hidden sm:block absolute top-10 left-10 w-20 h-20 border-2 border-primary/20 rounded-full" />
      <div className="hidden md:block absolute bottom-10 right-10 w-32 h-32 border-2 border-primary/20 rounded-full" />
      <div className="hidden sm:block absolute top-1/2 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse" />
      <div className="hidden sm:block absolute top-1/3 right-1/3 w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
      
      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 sm:px-6 py-2 mb-6 sm:mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">Offre de lancement</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 px-2">
            Prêt à transformer votre passion en <span className="text-primary">entreprise</span> ?
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
            Rejoignez des milliers de vendeurs qui ont déjà fait le choix de YouFizz pour développer leur activité en ligne.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-base sm:text-lg px-6 sm:px-8 md:px-10 py-5 sm:py-6 group min-h-[44px]"
            >
              Démarrer gratuitement
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 md:px-10 py-5 sm:py-6 border-border hover:bg-secondary min-h-[44px]"
            >
              Demander une démo
            </Button>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6 px-4">
            Sans engagement • Configuration en 5 minutes • Support inclus
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
