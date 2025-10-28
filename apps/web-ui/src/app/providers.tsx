'use client';

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize i18n on client side
    if (!i18n.isInitialized) {
      i18n.init();
    }
  }, []);

  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          {children}
        </TooltipProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
