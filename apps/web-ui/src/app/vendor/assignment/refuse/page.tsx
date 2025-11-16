'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/background/AnimatedBackground';
import { useToast } from '@/hooks/use-toast';

export default function RefuseAssignmentPage() {
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

    handleRefuse();
  }, [confermateurId, vendeurId]);

  const handleRefuse = async () => {
    if (!confermateurId || !vendeurId || loading) return;

    setLoading(true);
    
    try {
      const response = await fetch(`/api/auth/confermateurs/${confermateurId}/refuse-vendeur/${vendeurId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Échec du refus');
      }

      const data = await response.json();
      setCompleted(true);
      toast({
        title: 'Demande refusée',
        description: data.message || 'La demande a été refusée',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.message || 'Échec du refus de la demande',
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
              <div className="text-6xl mb-4">✗</div>
              <h1 className="text-2xl font-bold text-foreground">Demande refusée</h1>
              <p className="text-muted-foreground">
                La demande d'association a été refusée.
              </p>
              <Button onClick={() => router.push('/signin')} className="mt-4">
                Se connecter
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Traitement en cours...</h1>
              <p className="text-muted-foreground">
                {loading ? 'Refus de la demande...' : 'Veuillez patienter'}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

