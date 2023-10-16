import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import HomeButton from '@/components/buttons/HomeButton';
import { getQuizzesByUuidGQL } from '@/graphql/quizzes';
import Explanation from '@/page-components/quiz/game/Explanation';
import GameSummary from '@/page-components/quiz/game/GameSummary';
import PickAnAnswer from '@/page-components/quiz/game/PickAnAnswer';
import PickAnAnswerPlaceholder from '@/page-components/quiz/game/PickAnAnswerPlaceholder';
import QuizNotFound from '@/page-components/quiz/game/QuizNotFound';
import { getBackendImageUrl } from '@/utilities/getImageUrl';
import { isBrowser } from '@/utilities/isBrowser';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  Box,
  Card,
  CardContent,
  Alert,
  useTheme,
  Button,
  Snackbar,
  CardActions,
  Divider,
  Typography,
  Stack,
} from '@mui/material';
import {
  QueryClient,
  dehydrate,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import request from 'graphql-request';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

export type AnsweredState = {
  correctAnswerId: string;
  selectedAnswerId: string | null;
};

export const getServerSideProps: GetServerSideProps<{
  gameId: string;
}> = async (ctx) => {
  const id = ctx.params?.id;
  if (typeof id !== 'string') {
    return {
      notFound: true,
    };
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(['quiz', id], () =>
    request(process.env.NEXT_PUBLIC_GRAPHQL_URL, getQuizzesByUuidGQL, {
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
  const router = useRouter();
  const quizQuery = useQuery({
    queryKey: ['quiz', gameId],
    queryFn: () =>
      request(process.env.NEXT_PUBLIC_GRAPHQL_URL, getQuizzesByUuidGQL, {
        uuid: gameId,
      }),
    staleTime: Infinity,
  });
  const quiz = quizQuery.data?.quizzes?.data[0];
  const increasePlayCountMutation = useMutation({
    mutationKey: ['increasePlayCount'],
    mutationFn: async () =>
      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/increase-play-count`,
        {
          method: 'POST',
          body: JSON.stringify({
            quizId: quiz?.id ?? '',
          }),
        }
      ),
  });
  const [playCountIncreased, setPlayCountIncreased] = useState(false);
  const questions = useMemo(
    () => quiz?.attributes?.questions?.data ?? [],
    [quiz]
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answeredProgress, setAnswerwedProgress] = useState<AnsweredState[]>(
    []
  );
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);

  const question = questions[questionIndex];
  const gameDone = quizQuery.isSuccess && question == null;
  const answerState = answeredProgress[questionIndex] as
    | AnsweredState
    | undefined;
  const questionAnswered = answerState?.selectedAnswerId != null;
  const questionAnsweredCorrectly = questionAnswered
    ? answerState.selectedAnswerId === answerState.correctAnswerId
    : null;

  const borderColor = useMemo(() => {
    if (questionAnsweredCorrectly == null) {
      return 'transparent';
    }
    if (questionAnsweredCorrectly) {
      return theme.palette.success.main;
    }
    return theme.palette.error.main;
  }, [
    questionAnsweredCorrectly,
    theme.palette.error.main,
    theme.palette.success.main,
  ]);

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

  useEffect(() => {
    if (gameDone && !playCountIncreased) {
      increasePlayCountMutation.mutate();
      setPlayCountIncreased(true);
    }
  }, [gameDone, playCountIncreased, increasePlayCountMutation]);

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

  function nextQuestion() {
    setQuestionIndex((index) => index + 1);
  }

  const resultScore = useMemo(() => {
    if (!isBrowser()) return null;
    const answeredStates = answeredProgress.map(
      (answered) => answered.correctAnswerId === answered.selectedAnswerId
    );
    const lines: string[] = [];
    lines.push(`QUIZIO (${quiz?.attributes?.title ?? ''})`);
    lines.push(
      `Score: ${answeredStates.filter((correct) => correct).length}/${
        answeredProgress.length
      } answers correct`
    );
    lines.push(
      answeredStates.map((correct) => (correct ? '🟩' : '🟥')).join('')
    );
    lines.push(`${window.location.origin}${router.asPath}`);
    return lines.join('\n');
  }, [answeredProgress, quiz?.attributes?.title, router.asPath]);

  function writeResultToClipboard() {
    if (resultScore != null) {
      navigator.clipboard.writeText(resultScore);
      setShowCopiedAlert(true);
    }
  }

  function handleCopiedAlertClose(_event: unknown, reason?: string) {
    if (reason === 'clickaway') {
      return;
    }
    setShowCopiedAlert(false);
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
      {quizQuery.isLoading && <PickAnAnswerPlaceholder />}
      {quizQuery.isError && <GenericLoadingErrorMessage />}
      {quizQuery.isSuccess && (
        <>
          <Head>
            <meta property="og:title" content="Play Quizio" />
            <meta
              property="og:description"
              content={quiz?.attributes?.title ?? ''}
            />
            <meta
              property="og:image"
              content={getBackendImageUrl(
                quiz?.attributes?.image?.data?.attributes?.url
              )}
            />
          </Head>
          {questions.length === 0 ? (
            <QuizNotFound />
          ) : (
            <Card
              sx={{
                border: `3px solid ${borderColor}`,
              }}
            >
              {!gameDone && (
                <>
                  <CardContent sx={{ padding: 0 }}>
                    <PickAnAnswer
                      index={questionIndex + 1}
                      title={question.attributes?.title ?? ''}
                      answers={question.attributes!.answers!.data.map(
                        (answer) => ({
                          id: answer.id ?? '',
                          title: answer.attributes?.title ?? '',
                          correct: answer.attributes?.correct ?? false,
                        })
                      )}
                      answeredProgress={answeredProgress}
                      selectedAnswerId={answerState?.selectedAnswerId ?? null}
                      onAnswer={setAnswerOfCurrentQuestion}
                      imageUrl={
                        question.attributes?.questionImage?.data?.attributes
                          ?.url ?? null
                      }
                    />
                    {questionAnswered && (
                      <Box sx={{ paddingInline: 6 }}>
                        <Divider sx={{ marginBlock: 4 }} />
                        <Explanation
                          correct={questionAnsweredCorrectly ?? false}
                          text={question.attributes?.explanation ?? ''}
                          imageUrl={
                            question.attributes?.explanationImage?.data
                              ?.attributes?.url ?? null
                          }
                        />
                      </Box>
                    )}
                  </CardContent>
                  <CardActions
                    sx={{
                      marginTop: 2,
                      marginBottom: 4,
                      paddingInline: 6,
                      display: 'flex',
                      justifyContent: 'end',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Button
                      variant="contained"
                      disabled={answerState?.selectedAnswerId == null}
                      onClick={nextQuestion}
                    >
                      {questionIndex + 1 < questions.length
                        ? 'Next Question'
                        : 'Finish quiz'}
                    </Button>
                  </CardActions>
                </>
              )}
              {gameDone && (
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
                      explanation: question.attributes?.explanation ?? '',
                    }))}
                    answeredProgress={answeredProgress}
                  />
                  <Divider />
                  <Stack
                    alignItems="center"
                    gap={2}
                    sx={{ marginBottom: 2, marginTop: 2 }}
                  >
                    <Typography
                      sx={{ whiteSpace: 'pre-line', textAlign: 'center' }}
                    >
                      {resultScore}
                    </Typography>
                    <Button
                      variant="contained"
                      endIcon={<ContentCopyIcon />}
                      onClick={writeResultToClipboard}
                    >
                      Copy
                    </Button>
                  </Stack>
                  <CardActions
                    sx={{
                      marginTop: 4,
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <HomeButton />
                  </CardActions>
                </CardContent>
              )}
            </Card>
          )}
        </>
      )}
      <Snackbar
        open={showCopiedAlert}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        autoHideDuration={2000}
        onClose={handleCopiedAlertClose}
      >
        <Alert severity="info" onClose={handleCopiedAlertClose}>
          Copied to clipboard
        </Alert>
      </Snackbar>
    </Box>
  );
}
