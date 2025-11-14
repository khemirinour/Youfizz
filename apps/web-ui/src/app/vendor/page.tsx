'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import VendorNavbar from '@/components/VendorNavbar';
import { getArticleHealth } from '@/lib/articles.api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AnimatedBackground from '@/components/background/AnimatedBackground';

const VendorDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated, vendorId } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    const api = (useAuthStore as any).persist;
    if (api?.hasHydrated?.()) setHydrated(true);
    const unsub = api?.onFinishHydration?.(() => setHydrated(true));
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || user?.role !== 'vendeur') {
      router.replace('/signin');
    }
  }, [hydrated, isAuthenticated, user?.role, router]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'vendeur') return;
    const fetchHealth = async () => {
      try {
        setHealthLoading(true);
        const health = await getArticleHealth();
        setHealthStatus(health?.status || 'unknown');
      } catch (e) {
        setHealthStatus('down');
      } finally {
        setHealthLoading(false);
      }
    };
    fetchHealth();
  }, [hydrated, isAuthenticated, user?.role]);

  if (!hydrated || !isAuthenticated || user?.role !== 'vendeur') return null;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <AnimatedBackground />
      
      {/* --- Navbar avec logo sombre --- */}
      <VendorNavbar logoSrc="/logo-dark.png" />

      <div className="relative z-20 max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Bienvenue sur votre Dashboard</h1>
            <p className="text-muted-foreground">Gérez vos articles et suivez votre inventaire</p>
          </div>
          <Link href="/vendor/articles/new">
            <Button>
              Créer un article
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-xl p-6 shadow-lg border-border bg-card">
            <p className="text-sm text-muted-foreground">Statut du service Article</p>
            <p className="text-3xl font-semibold mt-2 text-primary">
              {healthLoading ? 'Chargement...' : healthStatus || 'inconnu'}
            </p>
          </Card>

          <Card className="rounded-xl p-6 shadow-lg border-border bg-card">
            <p className="text-sm text-muted-foreground">Identifiant Vendeur</p>
            <p className="text-3xl font-semibold mt-2 text-primary">{vendorId || 'N/A'}</p>
          </Card>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/vendor/articles')}
              className="bg-secondary hover:bg-secondary/80 rounded-lg p-4 text-left transition-colors border border-border/60"
            >
              <h3 className="font-semibold mb-1 text-foreground">Voir tous les articles</h3>
              <p className="text-sm text-muted-foreground">Parcourir et gérer vos articles</p>
            </button>

            <button
              onClick={() => router.push('/vendor/articles/new')}
              className="bg-secondary hover:bg-secondary/80 rounded-lg p-4 text-left transition-colors border border-border/60"
            >
              <h3 className="font-semibold mb-1 text-foreground">Créer un nouvel article</h3>
              <p className="text-sm text-muted-foreground">Ajouter un nouveau produit</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
