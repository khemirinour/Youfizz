'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border-2 border-primary/20 rounded-full" />
      <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-primary/20 rounded-full" />
      <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse" />
      <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-2 mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Offre de lancement</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Prêt à transformer votre passion en <span className="text-primary">entreprise</span> ?
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Rejoignez des milliers de vendeurs qui ont déjà fait le choix de YouFizz pour développer leur activité en ligne.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 group">
              Démarrer gratuitement
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-border hover:bg-secondary">
              Demander une démo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Sans engagement • Configuration en 5 minutes • Support inclus
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
