import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import HomeButton from '@/components/buttons/HomeButton';
import Explanation from '@/page-components/quiz/game/Explanation';
import GameSummary from '@/page-components/quiz/game/GameSummary';
import PickAnAnswer from '@/page-components/quiz/game/PickAnAnswer';
import PickAnAnswerPlaceholder from '@/page-components/quiz/game/PickAnAnswerPlaceholder';
import QuizNotFound from '@/page-components/quiz/game/QuizNotFound';
import { playQuiz, usePlayQuizQuery } from '@/data/usePlayQuizQuery';
import { isBrowser } from '@/utilities/isBrowser';
import { timeout } from '@/utilities/timeout';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { QueryClient, dehydrate, useQueryClient } from '@tanstack/react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePlayProtocolEntryMutation } from '../../data/usePlayProtocolEntryMutation';
import { throwOnError } from '@/api-client';
import { prefixWithBackendUrl } from '@/utilities/urlUtils';
import { useSession } from 'next-auth/react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export type AnsweredState = {
  correctAnswerId: string;
  selectedAnswerId: string | null;
};

export const getServerSideProps: GetServerSideProps<{
  uuid: string;
}> = async (ctx) => {
  const uuid = ctx.params?.uuid;
  if (typeof uuid !== 'string') {
    return {
      notFound: true,
    };
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['getQuiz', uuid],
    queryFn: async () => throwOnError(() => playQuiz(uuid)),
  });

  return {
    props: {
      uuid,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default function PlayIdPage({ uuid }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const topAnchor = useRef<HTMLDivElement>(null);
  const resultAnchor = useRef<HTMLDivElement>(null);
  const quizQuery = usePlayQuizQuery(uuid);
  const quiz = quizQuery.data;
  const { mutateAsync: addPlayProtocolEntry } = usePlayProtocolEntryMutation();

  const [playCountIncreased, setPlayCountIncreased] = useState(false);
  const questions = useMemo(() => quiz?.questions ?? [], [quiz]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answeredProgress, setAnswerwedProgress] = useState<AnsweredState[]>([]);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);

  const question = questions[questionIndex];
  const gameDone = quizQuery.isSuccess && question == null;
  const answerState = answeredProgress[questionIndex] as AnsweredState | undefined;
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
  }, [questionAnsweredCorrectly, theme.palette.error.main, theme.palette.success.main]);

  useEffect(() => {
    setQuestionIndex(0);
    setAnswerwedProgress(
      questions.map((question) => ({
        correctAnswerId: question.answers.find((answer) => answer.isCorrect)!.uuid,
        selectedAnswerId: null,
      })),
    );
  }, [questions]);

  useEffect(() => {
    async function increasePlayCountAsync() {
      try {
        await addPlayProtocolEntry({
          quizUuid: uuid,
          userUuid: session?.user.uuid ?? null,
        });

        queryClient.invalidateQueries({ queryKey: ['getQuizzesInfinite'] });
        setPlayCountIncreased(true);
      } catch (error) {
        console.error('Could not increase playcount', error);
      }
    }

    if (gameDone && !playCountIncreased) {
      increasePlayCountAsync();
    }
  }, [gameDone, playCountIncreased, addPlayProtocolEntry, uuid, queryClient, session?.user.uuid]);

  async function setAnswerOfCurrentQuestion(selectedAnswerId: string) {
    setAnswerwedProgress((progress) =>
      progress.map((answeredState, i) =>
        i === questionIndex
          ? {
              selectedAnswerId: selectedAnswerId,
              correctAnswerId: answeredState.correctAnswerId,
            }
          : answeredState,
      ),
    );
    await timeout(0);
    resultAnchor?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }

  async function onNextQuestionClick() {
    setQuestionIndex((index) => index + 1);
    if (!isLastQuestion) {
      await timeout(0);
      topAnchor?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  const resultScore = useMemo(() => {
    if (!isBrowser()) return null;
    const answeredStates = answeredProgress.map((answered) => answered.correctAnswerId === answered.selectedAnswerId);
    const lines: string[] = [];
    lines.push(`QUIZIO (${quiz?.title ?? ''})`);
    lines.push(
      `Score: ${answeredStates.filter((correct) => correct).length}/${answeredProgress.length} answers correct`,
    );
    lines.push(answeredStates.map((correct) => (correct ? '🟩' : '🟥')).join(''));
    lines.push(`${window.location.origin}${router.asPath}`);
    return lines.join('\n');
  }, [answeredProgress, quiz?.title, router.asPath]);
  const isLastQuestion = questionIndex + 1 === questions.length;

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
      {quizQuery.isPending && <PickAnAnswerPlaceholder />}
      {quizQuery.isError && <GenericLoadingErrorMessage />}
      {quizQuery.isSuccess && (
        <>
          <Head>
            <meta property="og:title" content="Play Quizio" />
            <meta property="og:description" content={quiz?.title ?? ''} />
            <meta property="og:image" content={quiz?.imageUrl ? prefixWithBackendUrl(quiz.imageUrl) : undefined} />
          </Head>
          <div ref={topAnchor} />
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
                      title={question.title ?? ''}
                      answers={question.answers.map((answer) => ({
                        id: answer.uuid,
                        title: answer.title,
                        correct: answer.isCorrect,
                      }))}
                      answeredProgress={answeredProgress}
                      selectedAnswerId={answerState?.selectedAnswerId ?? null}
                      onAnswer={setAnswerOfCurrentQuestion}
                      imageUrl={question.imageUrl}
                    />
                    {questionAnswered && (
                      <Box sx={{ paddingInline: 6 }}>
                        <Divider sx={{ marginBlock: 4 }} />
                        <Explanation
                          correct={questionAnsweredCorrectly ?? false}
                          text={question.explanation ?? ''}
                          imageUrl={question.explanationImageUrl}
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
                      onClick={onNextQuestionClick}
                    >
                      {!isLastQuestion ? 'Next Question' : 'Finish quiz'}
                    </Button>
                  </CardActions>
                  <div ref={resultAnchor} />
                </>
              )}
              {gameDone && (
                <CardContent>
                  <GameSummary
                    questions={questions.map((question) => ({
                      id: question.uuid,
                      title: question.title,
                      answers:
                        question.answers.map((answer) => ({
                          id: answer.uuid,
                          title: answer.title,
                          correct: answer.isCorrect,
                        })) ?? [],
                      explanation: question.explanation ?? '',
                    }))}
                    answeredProgress={answeredProgress}
                  />
                  <Divider />
                  <Stack alignItems="center" gap={2} sx={{ marginBottom: 2, marginTop: 2 }}>
                    <Typography sx={{ whiteSpace: 'pre-line', textAlign: 'center' }}>{resultScore}</Typography>
                    <Button variant="contained" endIcon={<ContentCopyIcon />} onClick={writeResultToClipboard}>
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
