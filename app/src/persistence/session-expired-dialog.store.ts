import { create } from 'zustand';

type SessionExpiredDialogStore = {
  isSessionExpiredDialogShown: boolean;
  showSessionExpiredDialog: () => void;
  hideSessionExpiredDialog: () => void;
};

export const useSessionExpiredDialogStore = create<SessionExpiredDialogStore>((set) => ({
  isSessionExpiredDialogShown: false,
  showSessionExpiredDialog: () =>
    set(() => ({
      isSessionExpiredDialogShown: true,
    })),
  hideSessionExpiredDialog: () =>
    set(() => ({
      isSessionExpiredDialogShown: false,
    })),
}));
