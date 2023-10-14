import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { useAuthHeader } from './useAuthHeader';
import { useHandleGqlUnauthorized } from './useHandleGqlUnauthorized';
import { useSession } from 'next-auth/react';
import { healthCheckGql } from '@/graphql/health';
import { seconds } from '@/utilities/time';

export function useGqlHealthCheck() {
  const { data: session } = useSession();
  const { authHeader } = useAuthHeader();

  const { error } = useQuery({
    queryKey: ['gqlHealthCheck'],
    queryFn: () =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        healthCheckGql,
        {},
        authHeader
      ),
    enabled: session != null,
    staleTime: seconds(10),
  });

  useHandleGqlUnauthorized([error]);
}
