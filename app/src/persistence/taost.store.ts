import { AlertProps } from '@mui/material/Alert';
import { ReactNode } from 'react';
import { create } from 'zustand';

export type SnackbarMessage = {
  key: number;
  content: ReactNode;
  severity: NonNullable<AlertProps['severity']>;
  variant?: AlertProps['variant'];
};

type ToastStore = {
  snackPack: SnackbarMessage[];
  showToast: (message: Omit<SnackbarMessage, 'key'>) => void;
  showInfoToast: (content: ReactNode) => void;
  showSuccessToast: (content: ReactNode) => void;
  showWarningToast: (content: ReactNode) => void;
  showErrorToast: (content: ReactNode) => void;
  removeToast: () => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  snackPack: [],
  showToast: (message: Omit<SnackbarMessage, 'key'>) =>
    set((state) => ({
      snackPack: [
        ...state.snackPack,
        {
          key: new Date().getTime(),
          content: message.content,
          severity: message.severity,
          variant: message.variant ?? 'filled',
        },
      ],
    })),

  showInfoToast: (content: ReactNode) =>
    set((state) => ({
      snackPack: [
        ...state.snackPack,
        {
          key: new Date().getTime(),
          content,
          severity: 'info',
          variant: 'filled',
        },
      ],
    })),
  showSuccessToast: (content: ReactNode) =>
    set((state) => ({
      snackPack: [
        ...state.snackPack,
        {
          key: new Date().getTime(),
          content,
          severity: 'success',
          variant: 'filled',
        },
      ],
    })),
  showWarningToast: (content: ReactNode) =>
    set((state) => ({
      snackPack: [
        ...state.snackPack,
        {
          key: new Date().getTime(),
          content,
          severity: 'warning',
          variant: 'filled',
        },
      ],
    })),
  showErrorToast: (content: ReactNode) =>
    set((state) => ({
      snackPack: [
        ...state.snackPack,
        {
          key: new Date().getTime(),
          content,
          severity: 'error',
          variant: 'filled',
        },
      ],
    })),
  removeToast: () =>
    set((state) => ({
      snackPack: state.snackPack.slice(1),
    })),
}));
