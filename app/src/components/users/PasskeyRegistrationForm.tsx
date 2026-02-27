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

export function PasskeyRegistrationForm() {
  const t = useTranslations('users.form.passkey'); // Will need translation keys
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
        showErrorToast('Failed to start passkey registration');
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
        showErrorToast('Failed to finish passkey registration');
      } else {
        showSuccessToast('Passkey registered successfully');
      }
    } catch (error: any) {
      console.error(error);
      if (error.name === 'NotAllowedError') {
        showErrorToast('Passkey registration cancelled');
      } else {
        showErrorToast(`Registration error: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Stack direction="column" gap={2}>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleRegisterPasskey}
        disabled={isPending}
        startIcon={isPending ? <LoadingCircle /> : <FingerprintIcon />}
      >
        Register New Passkey
      </Button>
    </Stack>
  );
}
