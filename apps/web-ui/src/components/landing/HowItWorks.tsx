'use client';

import { Package, Edit, ShoppingBag, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Package,
    number: "01",
    title: "Créez votre compte",
    description: "Inscrivez-vous gratuitement en quelques clics et accédez à votre tableau de bord."
  },
  {
    icon: Edit,
    number: "02",
    title: "Configurez votre boutique",
    description: "Personnalisez votre vitrine et ajoutez vos premiers produits facilement."
  },
  {
    icon: ShoppingBag,
    number: "03",
    title: "Commencez à vendre",
    description: "Recevez vos premières commandes et gérez-les depuis votre interface intuitive."
  },
  {
    icon: TrendingUp,
    number: "04",
    title: "Développez votre activité",
    description: "Analysez vos performances et optimisez votre stratégie pour croître rapidement."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Lancez votre activité en ligne en 4 étapes simples
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20" style={{ top: "80px" }} />
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 relative z-10">
                  {/* Step number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.number}
                  </div>
                  
                  <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
