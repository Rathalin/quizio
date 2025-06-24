import { apiClient, throwOnError } from '@/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AttestationFormat,
  AuthenticatorSelectionCriteria,
  AuthenticatorTransportFuture,
  PublicKeyCredentialHint,
  startRegistration,
} from '@simplewebauthn/browser';
import { raise } from '@/utilities/errorHandling';
import { AuthorizationHeader, useAuthHeader } from '@/custom-hooks/useAuthHeader';

export function useCreatePasskeyMutation() {
  const authHeader = useAuthHeader();
  return useMutation({
    mutationKey: ['createPasskey'],
    mutationFn: async () => {
      const { data, error } = await createPasskey(authHeader);
      if (error != null) {
        throw error;
      }
      const { publicKey } = data;
      console.log('Public Key', publicKey);
      if (publicKey == null) {
        throw new Error('Missing public key');
      }
      try {
        return startRegistration({
          optionsJSON: {
            challenge: (publicKey.challenge as string | undefined) ?? raise('Missing challenge'),
            pubKeyCredParams:
              publicKey.pubKeyCredParams?.map((param) => ({
                alg: param.alg ?? raise('Missing alg'),
                type: 'public-key',
              })) ?? [],
            rp: {
              id: publicKey.rp?.id,
              name: publicKey.rp?.name ?? raise('Missing rp'),
            },
            user: {
              id: (publicKey.user?.id ?? raise('Missing user.id')) as string,
              displayName: publicKey.user?.displayName ?? raise('Missing user.displayName'),
              name: publicKey.user?.name ?? raise('Missing user.name'),
            },
            attestation: publicKey.attestation as AttestationConveyancePreference,
            attestationFormats: publicKey.attestationFormats as AttestationFormat[],
            authenticatorSelection: (publicKey.authenticatorSelection ??
              raise('Missing authenticatorSelection')) as AuthenticatorSelectionCriteria,
            excludeCredentials:
              publicKey.excludeCredentials?.map((c) => ({
                id: c.id!.join(', '),
                type: 'public-key',
                transports: c.transports! as AuthenticatorTransportFuture[],
              })) ?? [],
            extensions: publicKey.extensions,
            hints: publicKey.hints as PublicKeyCredentialHint[],
            timeout: publicKey.timeout,
          },
        });
      } catch (e) {
        throw e;
      }

      // await fetch('/api/passkey/verify-registration', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ credential: attResp }),
      // });
    },
    retry: false,
  });
}

async function createPasskey(authHeader: AuthorizationHeader) {
  return apiClient.GET('/a/passkey/generate-registration-options', {
    headers: authHeader,
  });
}
