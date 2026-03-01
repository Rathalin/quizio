import { useState } from 'react';
import { useToastStore } from '@/persistence/taost.store';
import { useTranslations } from 'next-intl';
import { startRegistration } from '@simplewebauthn/browser';
import { apiClient } from '@/api-client';
import Button from '@mui/material/Button';
import LoadingCircle from '@/components/LoadingCircle';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import Stack from '@mui/material/Stack';
import { useAuthHeader } from '@/custom-hooks/useAuthHeader';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type Props = {
  onSuccess?: () => void;
}

export function PasskeyRegistrationForm({ onSuccess }: Props) {
  const t = useTranslations('signIn.form.registerPasskey');
  const { showSuccessToast, showErrorToast } = useToastStore();
  const [isPending, setIsPending] = useState(false);
  const authHeader = useAuthHeader();

  async function handleRegisterPasskey() {
    setIsPending(true);
    try {
      // 1. Get creation options from backend
      const { data: optionsData, error: optionsError } = await apiClient.GET('/me/auth/passkeys/register/start', {
        headers: authHeader,
      });

      if (optionsError || !optionsData?.publicKey) {
        showErrorToast(t('status.errorStart'));
        setIsPending(false);
        return;
      }

      // 2. Browser interacts with authenticator
      const attResp = await startRegistration(optionsData.publicKey as any);

      // 3. Send response back to backend
      const finishResp = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/me/auth/passkeys/register/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(attResp),
      });

      if (!finishResp.ok) {
        showErrorToast(t('status.errorFinish'));
      } else {
        showSuccessToast(t('status.success'));
        onSuccess?.();
      }
    } catch (error: any) {
      console.error(error);
      if (error.name === 'NotAllowedError') {
        showErrorToast(t('status.errorCancel'));
      } else {
        showErrorToast(`${t('status.errorGeneral')}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outlined"
      size="large"
      onClick={handleRegisterPasskey}
      disabled={isPending}
      startIcon={isPending ? <LoadingCircle /> : <FingerprintIcon />}
    >
      {t('button.label')}
    </Button>
  );
}
