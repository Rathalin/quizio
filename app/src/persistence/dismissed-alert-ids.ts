import { create } from 'zustand';

type DismissedAlertIdsState = {
  dismissedAlertIds: string[];
  addDismissedAlertId: (id: string) => void;
};

export const useDismissedAlertIds = create<DismissedAlertIdsState>()((set) => ({
  dismissedAlertIds: [],
  addDismissedAlertId: (id) =>
    set((state) => ({
      dismissedAlertIds: [...state.dismissedAlertIds, id],
    })),
}));
