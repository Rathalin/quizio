import { getUsersByUuidGQL } from '@/graphql/user';
import { Box } from '@mui/material';
import request from 'graphql-request';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps<{
  userId: string | null;
}> = async (ctx) => {
  const uuid = ctx.params?.uuid;
  if (typeof uuid != 'string') {
    return {
      notFound: true,
    };
  }

  try {
    const queryResult = await request(
      process.env.NEXT_PUBLIC_GRAPHQL_URL,
      getUsersByUuidGQL,
      { uuid }
    );
    return {
      props: {
        userId: queryResult.usersPermissionsUsers?.data?.at(0)?.id ?? null,
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: '/500',
      },
      props: {
        userId: null,
      },
    };
  }
};

export default function UserIdPage({
  userId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // const { data } = useQuery({
  //   queryKey: ['user', userId],
  //   queryFn: request(process.env.NEXT_PUBLIC_GRAPHQL_URL, ),
  //   enabled: userId != null,
  // });

  return <Box>{userId}</Box>;
}
