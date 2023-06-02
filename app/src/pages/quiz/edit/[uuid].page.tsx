import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps<{ uuid: string }> = async (
  ctx
) => {
  const uuid = ctx.params?.uuid;
  if (typeof uuid !== 'string') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      uuid,
    },
  };
};

export default function QuizEditPage({
  uuid,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <div>QuizEditPage {uuid}</div>;
}
