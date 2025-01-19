import {
  client,
  InferFetchError,
  InferFetchResult,
  throwOnError,
} from '@/api-client';
import { seconds } from '@/utilities/time';
import { useQuery } from '@tanstack/react-query';

export function useAlertsQuery() {
  return useQuery<
    InferFetchResult<typeof fetchAlerts>,
    InferFetchError<typeof fetchAlerts>
  >({
    queryKey: ['alerts'],
    queryFn: () => throwOnError(() => fetchAlerts()),
    staleTime: seconds(30),
  });
}

async function fetchAlerts() {
  return client.GET('/alerts');
}
