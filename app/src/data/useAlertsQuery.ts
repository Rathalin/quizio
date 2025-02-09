import { apiClient, GetAlertsRequestQuery, InferFetchError, InferFetchResult, throwOnError } from '@/api-client';
import { seconds } from '@/utilities/time';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export function useAlertsQuery() {
  const { status } = useSession();
  const visibleTo: GetAlertsRequestQuery['visibleTo'] = status === 'authenticated' ? 'authorized' : 'everyone';
  return useQuery<InferFetchResult<typeof fetchAlerts>, InferFetchError<typeof fetchAlerts>>({
    queryKey: ['alerts', visibleTo],
    queryFn: () => throwOnError(() => fetchAlerts({ visibleTo })),
    staleTime: seconds(30),
    enabled: status !== 'loading',
  });
}

async function fetchAlerts(query: GetAlertsRequestQuery) {
  return apiClient.GET('/alerts', {
    params: {
      query,
    },
  });
}
