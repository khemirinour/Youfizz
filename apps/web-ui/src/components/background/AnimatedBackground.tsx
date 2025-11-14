'use client';

import { ShoppingCart } from "lucide-react";

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grandes bulles principales */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      {/* Multiples chariots de shopping animés - démarrent immédiatement */}
      <div className="absolute top-[20%] animate-slide-cart">
        <ShoppingCart className="w-32 h-32 text-primary/60 drop-shadow-[0_0_20px_rgba(255,119,51,0.5)]" strokeWidth={1.5} />
      </div>
      <div className="absolute top-[40%] animate-slide-cart" style={{ animationDelay: "5s" }}>
        <ShoppingCart className="w-28 h-28 text-primary/50 drop-shadow-[0_0_15px_rgba(255,119,51,0.4)]" strokeWidth={1.5} />
      </div>
      <div className="absolute top-[60%] animate-slide-cart" style={{ animationDelay: "10s" }}>
        <ShoppingCart className="w-36 h-36 text-primary/70 drop-shadow-[0_0_25px_rgba(255,119,51,0.6)]" strokeWidth={1.5} />
      </div>
      <div className="absolute top-[80%] animate-slide-cart" style={{ animationDelay: "2.5s" }}>
        <ShoppingCart className="w-30 h-30 text-primary/55 drop-shadow-[0_0_18px_rgba(255,119,51,0.45)]" strokeWidth={1.5} />
      </div>
      
      {/* Étoiles flottantes - petits points orange (doublé) */}
      <div className="absolute top-[15%] left-[10%] w-3 h-3 bg-primary/60 rounded-full blur-sm animate-pulse" />
      <div className="absolute top-[25%] left-[85%] w-2 h-2 bg-primary/50 rounded-full blur-sm animate-pulse" style={{ animationDelay: "0.5s" }} />
      <div className="absolute top-[35%] right-[15%] w-4 h-4 bg-primary/40 rounded-full blur-md animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-[45%] left-[20%] w-2 h-2 bg-primary/55 rounded-full blur-sm animate-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-[55%] right-[25%] w-3 h-3 bg-primary/45 rounded-full blur-sm animate-pulse" style={{ animationDelay: "2s" }} />
      <div className="absolute top-[65%] left-[70%] w-2 h-2 bg-primary/50 rounded-full blur-sm animate-pulse" style={{ animationDelay: "0.8s" }} />
      <div className="absolute top-[75%] left-[30%] w-4 h-4 bg-primary/35 rounded-full blur-md animate-pulse" style={{ animationDelay: "1.2s" }} />
      <div className="absolute bottom-[20%] right-[40%] w-3 h-3 bg-primary/60 rounded-full blur-sm animate-pulse" style={{ animationDelay: "1.8s" }} />
      <div className="absolute bottom-[15%] left-[50%] w-2 h-2 bg-primary/45 rounded-full blur-sm animate-pulse" style={{ animationDelay: "2.5s" }} />
      <div className="absolute top-[10%] right-[30%] w-3 h-3 bg-primary/50 rounded-full blur-md animate-pulse" style={{ animationDelay: "0.3s" }} />
      <div className="absolute top-[40%] left-[5%] w-2 h-2 bg-primary/55 rounded-full blur-sm animate-pulse" style={{ animationDelay: "1.7s" }} />
      <div className="absolute bottom-[30%] right-[10%] w-4 h-4 bg-primary/40 rounded-full blur-md animate-pulse" style={{ animationDelay: "2.2s" }} />
      
      {/* Étoiles supplémentaires (doublé) */}
      <div className="absolute top-[12%] left-[45%] w-2 h-2 bg-primary/55 rounded-full blur-sm animate-pulse" style={{ animationDelay: "0.7s" }} />
      <div className="absolute top-[22%] right-[20%] w-3 h-3 bg-primary/50 rounded-full blur-md animate-pulse" style={{ animationDelay: "1.3s" }} />
      <div className="absolute top-[32%] left-[60%] w-2 h-2 bg-primary/60 rounded-full blur-sm animate-pulse" style={{ animationDelay: "0.4s" }} />
      <div className="absolute top-[42%] right-[50%] w-4 h-4 bg-primary/45 rounded-full blur-md animate-pulse" style={{ animationDelay: "1.9s" }} />
      <div className="absolute top-[52%] left-[15%] w-3 h-3 bg-primary/50 rounded-full blur-sm animate-pulse" style={{ animationDelay: "0.6s" }} />
      <div className="absolute top-[62%] right-[60%] w-2 h-2 bg-primary/55 rounded-full blur-sm animate-pulse" style={{ animationDelay: "1.4s" }} />
      <div className="absolute top-[72%] left-[55%] w-3 h-3 bg-primary/40 rounded-full blur-md animate-pulse" style={{ animationDelay: "0.9s" }} />
      <div className="absolute bottom-[25%] left-[25%] w-2 h-2 bg-primary/50 rounded-full blur-sm animate-pulse" style={{ animationDelay: "2.1s" }} />
      <div className="absolute bottom-[18%] right-[25%] w-4 h-4 bg-primary/45 rounded-full blur-md animate-pulse" style={{ animationDelay: "0.2s" }} />
      <div className="absolute top-[8%] left-[35%] w-3 h-3 bg-primary/55 rounded-full blur-sm animate-pulse" style={{ animationDelay: "1.6s" }} />
      <div className="absolute top-[38%] right-[8%] w-2 h-2 bg-primary/60 rounded-full blur-sm animate-pulse" style={{ animationDelay: "2.3s" }} />
      <div className="absolute bottom-[35%] left-[80%] w-3 h-3 bg-primary/50 rounded-full blur-md animate-pulse" style={{ animationDelay: "0.8s" }} />
    </div>
  );
};

export default AnimatedBackground;

