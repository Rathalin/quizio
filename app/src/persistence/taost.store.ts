import { AlertProps } from '@mui/material/Alert';
import { create } from 'zustand';

export type SnackbarMessage = {
  key: number;
  message: string;
  severity: NonNullable<AlertProps['severity']>;
  variant: NonNullable<AlertProps['variant']>;
};

type ToastStore = {
  snackPack: SnackbarMessage[];
  showToast: (
    message: string,
    severity: NonNullable<AlertProps['severity']>,
    variant?: NonNullable<AlertProps['variant']>,
  ) => void;
  removeToast: () => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  snackPack: [],
  showToast: (message, severity, variant = 'filled') =>
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
