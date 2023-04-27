import { create } from 'zustand';

type PageTransitionState = {
  transitionHref: string | null;
  transitionReason: string | null;
  setReason: (reason: string) => void;
  startTransitioning: (href: string, transitionReason?: string) => void;
  stopTransitioning: () => void;
};

export const usePageTransition = create<PageTransitionState>()((set) => ({
  transitionHref: null,
  transitionReason: null,
  setReason: (transitionReason) => set({ transitionReason }),
  startTransitioning: (href) => set({ transitionHref: href }),
  stopTransitioning: () =>
    set({ transitionHref: null, transitionReason: null }),
}));
