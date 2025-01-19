import {
  client,
  InferFetchError,
  InferFetchResult,
  throwOnError,
} from '@/api-client';
import {
  AuthorizationHeader,
  useAuthHeader,
} from '@/custom-hooks/useAuthHeader';
import { useQuery } from '@tanstack/react-query';

export function useQuizQuery(uuid: string) {
  const authHeader = useAuthHeader();
  // const { data: session } = useSession();
  // const userId = useMemo(() => {
  //   session?.user.uuid;
  // }, [session?.user.uuid]);

  return useQuery<
    InferFetchResult<typeof fetchQuiz>,
    InferFetchError<typeof fetchQuiz>
  >({
    queryKey: ['getQuiz', uuid],
    queryFn: () => throwOnError(() => fetchQuiz(uuid, authHeader)),
    // enabled: userId != null,
  });
}

export function fetchQuiz(uuid: string, authHeader: AuthorizationHeader) {
  return client.GET('/a/quiz/{uuid}', {
    params: {
      path: {
        uuid,
      },
    },
    headers: authHeader,
  });
}
