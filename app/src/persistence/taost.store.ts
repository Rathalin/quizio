import { AlertProps } from '@mui/material';
import { create } from 'zustand';

export type SnackbarMessage = {
  key: number;
  message: string;
  severity: NonNullable<AlertProps['severity']>;
  variant: NonNullable<AlertProps['variant']>;
};

type ToastStore = {
  snackPack: SnackbarMessage[];
  addToast: (
    message: string,
    severity: NonNullable<AlertProps['severity']>,
    variant?: NonNullable<AlertProps['variant']>
  ) => void;
  removeToast: () => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  snackPack: [],
  addToast: (message, severity, variant = 'standard') =>
    set((state) => ({
      snackPack: [
        ...state.snackPack,
        {
          message,
          key: new Date().getTime(),
          severity,
          variant,
        },
      ],
    })),
  removeToast: () =>
    set((state) => ({
      snackPack: state.snackPack.slice(1),
    })),
}));
