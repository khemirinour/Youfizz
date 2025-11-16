'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import VendorNavbar from '@/components/VendorNavbar';
import { getArticleHealth } from '@/lib/articles.api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import AnimatedBackground from '@/components/background/AnimatedBackground';
import { findConfermateurByEmail, requestConfermateurAssignment, type ConfermateurUser } from '@/lib/vendor.api';

const VendorDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated, vendorId } = useAuthStore();
  const { toast } = useToast();
  const [hydrated, setHydrated] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [healthLoading, setHealthLoading] = useState(true);
  const [confermateurEmail, setConfermateurEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [foundConfermateur, setFoundConfermateur] = useState<ConfermateurUser | null>(null);

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

  const handleSearch = async () => {
    if (!confermateurEmail) return;
    
    setSearching(true);
    setFoundConfermateur(null);
    
    try {
      const confermateur = await findConfermateurByEmail(confermateurEmail);
      setFoundConfermateur(confermateur);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || error?.message || 'Confermateur non trouvé',
        variant: 'destructive',
      });
      setFoundConfermateur(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!foundConfermateur || !user?.id) return;
    
    setSending(true);
    
    try {
      await requestConfermateurAssignment(user.id, foundConfermateur.email);
      toast({
        title: 'Succès',
        description: 'Demande envoyée avec succès. Le confermateur recevra un email.',
      });
      setConfermateurEmail('');
      setFoundConfermateur(null);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || error?.message || 'Échec de l\'envoi de la demande',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

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

        {/* Request Confermateur Assignment Section */}
        <Card className="rounded-xl p-6 shadow-lg border-border bg-card">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Demander un Confermateur</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Recherchez un confermateur par email et envoyez-lui une demande d'association
          </p>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="confermateur-email" className="sr-only">Email du confermateur</Label>
                <Input
                  id="confermateur-email"
                  type="email"
                  placeholder="email@confermateur.com"
                  value={confermateurEmail}
                  onChange={(e) => {
                    setConfermateurEmail(e.target.value);
                    setFoundConfermateur(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && confermateurEmail && !searching) {
                      handleSearch();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!confermateurEmail || searching}
              >
                {searching ? 'Recherche...' : 'Rechercher'}
              </Button>
            </div>

            {foundConfermateur && (
              <div className="border border-border rounded-lg p-4 bg-secondary/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      {foundConfermateur.firstName} {foundConfermateur.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{foundConfermateur.email}</p>
                  </div>
                  <Button
                    onClick={handleSendRequest}
                    disabled={sending}
                    variant="default"
                  >
                    {sending ? 'Envoi...' : 'Envoyer la demande'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

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
