import LinkButton from '@/components/LinkButton';
import { queryQuizzesByUuid } from '@/graphql/quizzes';
import GameSummary from '@/page-components/game/GameSummary';
import PickAnAnswer from '@/page-components/game/PickAnAnswer';
import QuizNotFound from '@/page-components/game/QuizNotFound';
import {
  Box,
  Card,
  CardContent,
  Alert,
  Snackbar,
  AlertColor,
} from '@mui/material';
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useEffect, useMemo, useState } from 'react';

export type Score = 'correct' | 'incorrect' | 'unset';

export const getServerSideProps: GetServerSideProps<{
  gameId: string;
}> = async (ctx) => {
  const queryClient = new QueryClient();
  const id = ctx.params?.id;
  if (typeof id !== 'string') {
    return {
      notFound: true,
    };
  }

  await queryClient.prefetchQuery(['quiz', id], () =>
    request(process.env.NEXT_PUBLIC_GRAPHQL_URL, queryQuizzesByUuid, {
      uuid: id,
    })
  );

  return {
    props: {
      gameId: id,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default function PlayIdPage({
  gameId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const quizQuery = useQuery({
    queryKey: ['quiz', gameId],
    queryFn: () =>
      request(process.env.NEXT_PUBLIC_GRAPHQL_URL, queryQuizzesByUuid, {
        uuid: gameId,
      }),
    staleTime: Infinity,
  });
  const quiz = quizQuery.data?.quizzes?.data[0];
  const questions = useMemo(
    () => quiz?.attributes?.questions?.data ?? [],
    [quiz]
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [scoreProgress, setScoreProgress] = useState<Score[]>([]);
  const [gameAlert, setGameAlert] = useState<{
    text: string;
    severity: AlertColor;
  } | null>();
  const question = questions[questionIndex];
  const gameDone = question == null;

  useEffect(() => {
    setQuestionIndex(0);
    setScoreProgress(questions.map<Score>(() => 'unset'));
  }, [questions]);

  function addScore(score: Score) {
    setScoreProgress((progress) =>
      progress.map((s, i) => (i === questionIndex ? score : s))
    );
  }

  function incrementQuestionIndex() {
    setQuestionIndex((index) => index + 1);
  }

  function handleAnswerClick(correct: boolean) {
    addScore(correct ? 'correct' : 'incorrect');
    incrementQuestionIndex();
  }

  return (
    <Box
      sx={{
        marginTop: {
          xs: 0,
          lg: 6,
        },
      }}
    >
      {quizQuery.isLoading && <Alert severity="info">Loading the quiz</Alert>}
      {quizQuery.isError && (
        <Alert severity="error">Could not load the quiz</Alert>
      )}
      {quizQuery.isSuccess && (
        <>
          {questions.length === 0 ? (
            <QuizNotFound />
          ) : (
            <>
              {!gameDone && (
                <Card>
                  <CardContent sx={{ padding: 0 }}>
                    <PickAnAnswer
                      title={question.attributes?.title ?? ''}
                      answers={question.attributes!.answers!.data.map(
                        (answer) => ({
                          id: answer.id ?? '',
                          title: answer.attributes?.title ?? '',
                          correct: answer.attributes?.correct ?? false,
                        })
                      )}
                      scoreProgress={scoreProgress}
                      onAnswer={handleAnswerClick}
                    />
                    <Box
                      sx={{
                        marginTop: 4,
                        marginInline: 4,
                        display: 'flex',
                        justifyContent: 'end',
                      }}
                    >
                      <LinkButton
                        hrefObserver="/"
                        navigateOnClick
                        variant="contained"
                      >
                        Stop Playing
                      </LinkButton>
                    </Box>
                  </CardContent>
                </Card>
              )}
              {gameDone && (
                <Card sx={{ paddingInline: 4 }}>
                  <CardContent>
                    <GameSummary
                      questions={questions.map((question) => ({
                        id: question.id ?? '',
                        title: question.attributes?.title ?? '',
                        answers:
                          question.attributes?.answers?.data.map((answer) => ({
                            id: answer.id ?? '',
                            title: answer.attributes?.title ?? '',
                            correct: answer.attributes?.correct ?? false,
                          })) ?? [],
                      }))}
                      scoreProgress={scoreProgress}
                    />
                    <Box
                      sx={{
                        marginTop: 4,
                        display: 'flex',
                        justifyContent: 'end',
                      }}
                    >
                      <LinkButton
                        hrefObserver="/"
                        navigateOnClick
                        variant="contained"
                      >
                        Home
                      </LinkButton>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
      <Snackbar
        open={gameAlert != null}
        onClose={() => setGameAlert(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={gameAlert?.severity ?? 'info'}>
          {gameAlert?.text ?? ''}
        </Alert>
      </Snackbar>
    </Box>
  );
}
