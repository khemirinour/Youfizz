'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/background/AnimatedBackground';
import { useToast } from '@/hooks/use-toast';

export default function AcceptAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const confermateurId = searchParams.get('confermateurId');
  const vendeurId = searchParams.get('vendeurId');

  useEffect(() => {
    if (!confermateurId || !vendeurId) {
      toast({
        title: 'Erreur',
        description: 'Paramètres manquants dans l\'URL',
        variant: 'destructive',
      });
      router.push('/signin');
      return;
    }

    handleAccept();
  }, [confermateurId, vendeurId]);

  const handleAccept = async () => {
    if (!confermateurId || !vendeurId || loading) return;

    setLoading(true);
    
    try {
      const response = await fetch(`/api/auth/confermateurs/${confermateurId}/accept-vendeur/${vendeurId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Échec de l\'acceptation');
      }

      const data = await response.json();
      setCompleted(true);
      toast({
        title: 'Succès',
        description: data.message || 'Demande acceptée avec succès',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.message || 'Échec de l\'acceptation de la demande',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md p-8 shadow-lg border-border bg-card">
          {completed ? (
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">✓</div>
              <h1 className="text-2xl font-bold text-foreground">Demande acceptée</h1>
              <p className="text-muted-foreground">
                Le vendeur a été assigné avec succès à votre compte confermateur.
              </p>
              <Button onClick={() => router.push('/signin')} className="mt-4">
                Se connecter
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Traitement en cours...</h1>
              <p className="text-muted-foreground">
                {loading ? 'Acceptation de la demande...' : 'Veuillez patienter'}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

