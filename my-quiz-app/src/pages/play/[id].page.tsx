import LinkButton from '@/components/LinkButton';
import { queryQuizzesByUuid } from '@/graphql/quizzes';
import AnswerFeedback from '@/page-components/game/AnswerFeedback';
import GameSummary from '@/page-components/game/GameSummary';
import PickAnAnswer from '@/page-components/game/PickAnAnswer';
import QuizNotFound from '@/page-components/game/QuizNotFound';
import {
  Box,
  Card,
  CardContent,
  Alert,
  AlertColor,
  useTheme,
  Button,
} from '@mui/material';
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useEffect, useMemo, useState } from 'react';

export type AnsweredState = {
  correctAnswerId: string;
  selectedAnswerId: string | null;
};

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
  const theme = useTheme();
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
  const [answeredProgress, setAnswerwedProgress] = useState<AnsweredState[]>(
    []
  );
  const [gameAlert, setGameAlert] = useState<{
    text: string;
    severity: AlertColor;
  } | null>(null);
  const question = questions[questionIndex];
  const gameDone = question == null;
  const answerState = answeredProgress[questionIndex] as
    | AnsweredState
    | undefined;
  const questionAnswered = answerState?.selectedAnswerId != null;
  const borderColor = useMemo(() => {
    const answeredCorrectly = questionAnswered
      ? answerState.selectedAnswerId === answerState.correctAnswerId
      : null;
    if (answeredCorrectly == null) {
      return 'transparent';
    }
    if (answeredCorrectly) {
      return theme.palette.success.main;
    }
    return theme.palette.error.main;
  }, [answerState, questionAnswered, theme]);

  useEffect(() => {
    setQuestionIndex(0);
    setAnswerwedProgress(
      questions.map((question) => ({
        correctAnswerId:
          question.attributes?.answers?.data.find(
            (answer) => answer.attributes?.correct
          )?.id ?? '0',
        selectedAnswerId: null,
      }))
    );
  }, [questions]);

  function setAnswerOfCurrentQuestion(selectedAnswerId: string) {
    setAnswerwedProgress((progress) =>
      progress.map((answeredState, i) =>
        i === questionIndex
          ? {
              selectedAnswerId: selectedAnswerId,
              correctAnswerId: answeredState.correctAnswerId,
            }
          : answeredState
      )
    );
  }

  function incrementQuestionIndex() {
    setQuestionIndex((index) => index + 1);
  }

  async function onAnswer(answerId: string) {
    setAnswerOfCurrentQuestion(answerId);
    // incrementQuestionIndex();
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
                <Card
                  sx={{
                    border: `3px solid ${borderColor}`,
                  }}
                >
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
                      answeredProgress={answeredProgress}
                      onAnswer={onAnswer}
                    />
                    <Box
                      sx={{
                        marginTop: 4,
                        marginInline: 4,
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <LinkButton
                        hrefObserver="/"
                        navigateOnClick
                        variant="outlined"
                      >
                        Stop Playing
                      </LinkButton>
                      <Button
                        variant="contained"
                        disabled={answerState?.selectedAnswerId == null}
                        onClick={incrementQuestionIndex}
                      >
                        Next Question
                      </Button>
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
                      answeredProgress={answeredProgress}
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
      <AnswerFeedback alert={gameAlert} onClose={() => setGameAlert(null)} />
    </Box>
  );
}
