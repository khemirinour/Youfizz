'use client';

import { useEffect, useRef, useState } from 'react';
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
import {
  findConfermateurByEmail,
  requestConfermateurAssignment,
  getConfermateursForVendeur,
  removeConfermateurForVendeur,
  type ConfermateurUser,
} from '@/lib/vendor.api';

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
  const [myConfermateurs, setMyConfermateurs] = useState<ConfermateurUser[]>([]);
  const [loadingConfermateurs, setLoadingConfermateurs] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const hasFetchedHealth = useRef(false);
  const hasFetchedConfermateurs = useRef(false);

  useEffect(() => {
    const api = (useAuthStore as any).persist;
    if (api?.hasHydrated?.()) setHydrated(true);
    const unsub = api?.onFinishHydration?.(() => setHydrated(true));
    return () => unsub?.();
  }, []);

  // Verify authentication and refresh token if needed
  useEffect(() => {
    if (!hydrated) return;
    
    const verifyAuth = async () => {
      // If we think we're authenticated but tokens might be missing, try to refresh
      if (isAuthenticated && user?.role === 'vendeur') {
        try {
          // Attempt to refresh token to verify we still have valid cookies
          const refreshed = await useAuthStore.getState().refreshToken();
          if (!refreshed) {
            // Refresh failed, redirect to signin
            router.replace('/signin');
          }
        } catch (error) {
          // Refresh failed, redirect to signin
          router.replace('/signin');
        }
      } else {
        // Not authenticated, redirect to signin
        router.replace('/signin');
      }
    };

    verifyAuth();
  }, [hydrated, isAuthenticated, user?.role, router]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'vendeur') return;
    if (hasFetchedHealth.current) return;
    hasFetchedHealth.current = true;
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

  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'vendeur' || !user?.id) return;
    if (hasFetchedConfermateurs.current) return;
    hasFetchedConfermateurs.current = true;

    const fetchConfermateurs = async () => {
      try {
        setLoadingConfermateurs(true);
        const confermateurs = await getConfermateursForVendeur(user.id);
        setMyConfermateurs(confermateurs || []);
      } catch (error: any) {
        toast({
          title: 'Erreur',
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Impossible de charger vos confermateurs",
          variant: 'destructive',
        });
      } finally {
        setLoadingConfermateurs(false);
      }
    };

    fetchConfermateurs();
  }, [hydrated, isAuthenticated, user?.role, user?.id, toast]);

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

  const handleRemoveConfermateur = async (confId: string) => {
    if (!user?.id) return;

    const confirmRemoval = window.confirm(
      'Êtes-vous sûr de vouloir retirer ce confermateur de votre liste ?',
    );
    if (!confirmRemoval) return;

    setRemovingId(confId);
    try {
      await removeConfermateurForVendeur(user.id, confId);
      setMyConfermateurs((prev) => prev.filter((c) => c.id !== confId));
      toast({
        title: 'Confermateur retiré',
        description: 'Le confermateur a été retiré de votre liste.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Impossible de retirer ce confermateur",
        variant: 'destructive',
      });
    } finally {
      setRemovingId(null);
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

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Mes Confermateurs</h3>
              {loadingConfermateurs ? (
                <p className="text-sm text-muted-foreground">Chargement de vos confermateurs...</p>
              ) : myConfermateurs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Vous n&apos;avez encore aucun confermateur associé.
                </p>
              ) : (
                <div className="space-y-2">
                  {myConfermateurs.map((conf) => (
                    <div
                      key={conf.id}
                      className="flex items-center justify-between border border-border rounded-lg px-3 py-2 bg-secondary/30"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {conf.firstName} {conf.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{conf.email}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={removingId === conf.id}
                        onClick={() => handleRemoveConfermateur(conf.id)}
                      >
                        {removingId === conf.id ? 'Suppression...' : 'Retirer'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
