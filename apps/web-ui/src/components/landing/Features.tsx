'use client';

import { Rocket, Shield, Zap, HeadphonesIcon } from "lucide-react";

const features = [
  {
    icon: Rocket,
    title: "Démarrage rapide",
    description: "Créez votre boutique en quelques minutes et commencez à vendre immédiatement."
  },
  {
    icon: Shield,
    title: "Paiements sécurisés",
    description: "Transactions protégées et conformes aux normes de sécurité les plus strictes."
  },
  {
    icon: Zap,
    title: "Performance optimale",
    description: "Plateforme ultra-rapide pour une expérience d'achat fluide et agréable."
  },
  {
    icon: HeadphonesIcon,
    title: "Support 24/7",
    description: "Une équipe dédiée à votre service pour répondre à toutes vos questions."
  }
];

const Features = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
            Pourquoi choisir <span className="text-primary">YouFizz</span> ?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Des outils puissants et intuitifs pour développer votre activité en ligne
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-primary/10 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
