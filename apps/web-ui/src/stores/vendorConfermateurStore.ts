import { create } from 'zustand';
import { ConfermateurUser } from '@/lib/vendor.api';
import { ConfermateurVendeur } from '@/lib/confermateur.api';

interface VendorConfermateurState {
  confermateursForVendeurCache: Record<string, ConfermateurUser[]>;
  vendeursForConfermateurCache: Record<string, ConfermateurVendeur[]>;
}

interface VendorConfermateurActions {
  setCachedConfermateursForVendeur: (vendeurUserId: string, data: ConfermateurUser[]) => void;
  getCachedConfermateursForVendeur: (vendeurUserId: string) => ConfermateurUser[] | undefined;
  setCachedVendeursForConfermateur: (confermateurUserId: string, data: ConfermateurVendeur[]) => void;
  getCachedVendeursForConfermateur: (confermateurUserId: string) => ConfermateurVendeur[] | undefined;
  clearCache: () => void;
  clearConfermateursForVendeur: (vendeurUserId: string) => void;
  clearVendeursForConfermateur: (confermateurUserId: string) => void;
}

type VendorConfermateurStore = VendorConfermateurState & VendorConfermateurActions;

export const useVendorConfermateurStore = create<VendorConfermateurStore>((set, get) => ({
  // Initial state
  confermateursForVendeurCache: {},
  vendeursForConfermateurCache: {},

  // Actions
  setCachedConfermateursForVendeur: (vendeurUserId: string, data: ConfermateurUser[]) => {
    set((state) => ({
      confermateursForVendeurCache: {
        ...state.confermateursForVendeurCache,
        [vendeurUserId]: data,
      },
    }));
  },

  getCachedConfermateursForVendeur: (vendeurUserId: string) => {
    return get().confermateursForVendeurCache[vendeurUserId];
  },

  setCachedVendeursForConfermateur: (confermateurUserId: string, data: ConfermateurVendeur[]) => {
    set((state) => ({
      vendeursForConfermateurCache: {
        ...state.vendeursForConfermateurCache,
        [confermateurUserId]: data,
      },
    }));
  },

  getCachedVendeursForConfermateur: (confermateurUserId: string) => {
    return get().vendeursForConfermateurCache[confermateurUserId];
  },

  clearCache: () => {
    set({ 
      confermateursForVendeurCache: {},
      vendeursForConfermateurCache: {},
    });
  },

  clearConfermateursForVendeur: (vendeurUserId: string) => {
    set((state) => {
      const newCache = { ...state.confermateursForVendeurCache };
      delete newCache[vendeurUserId];
      return { confermateursForVendeurCache: newCache };
    });
  },

  clearVendeursForConfermateur: (confermateurUserId: string) => {
    set((state) => {
      const newCache = { ...state.vendeursForConfermateurCache };
      delete newCache[confermateurUserId];
      return { vendeursForConfermateurCache: newCache };
    });
  },
}));

