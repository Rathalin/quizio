import { AlertProps } from '@mui/material';
import { create } from 'zustand';

export type SnackbarMessage = {
  key: number;
  message: string;
  severity: NonNullable<AlertProps['severity']>;
};

type ToastStore = {
  snackPack: SnackbarMessage[];
  addToast: (message: string, severity?: AlertProps['severity']) => void;
  removeToast: () => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  snackPack: [],
  addToast: (message, severity = 'info') =>
    set((state) => ({
      snackPack: [
        ...state.snackPack,
        { message, key: new Date().getTime(), severity },
      ],
    })),
  removeToast: () =>
    set((state) => ({
      snackPack: state.snackPack.slice(1),
    })),
}));
