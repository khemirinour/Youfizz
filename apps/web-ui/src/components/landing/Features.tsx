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
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pourquoi choisir <span className="text-primary">YouFizz</span> ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des outils puissants et intuitifs pour développer votre activité en ligne
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl p-8 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
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
