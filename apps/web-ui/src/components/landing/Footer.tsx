'use client';

import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import logo from "@/assets/youfizz-logo.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-1">
            <img src={logo.src || logo} alt="YouFizz" className="h-12 w-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              La marketplace qui transforme votre passion en succès.
            </p>
          </div>

          {/* Links columns */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Produit</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Fonctionnalités</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Tarifs</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Démo</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Ressources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Support</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Centre d'aide</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Entreprise</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">À propos</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Carrières</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Partenaires</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 YouFizz Marketplace. Tous droits réservés.
          </p>
          
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
