import GradientWord from '@/components/GradientWord';
import LinkButton from '@/components/LinkButton';
import ScoreProgress from '@/components/game/ScoreProgress';
import { queryQuizzesByUuid } from '@/graphql/quizzes';
import { Check as CheckIcon } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  List,
  Typography,
  ListItem,
  IconButton,
  ListItemButton,
  ListItemText,
  Chip,
  ListItemIcon,
  Alert,
  Button,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useEffect, useMemo, useState } from 'react';

export type Score = 'correct' | 'incorrect' | 'unset';

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
    <Box>
      {quizQuery.isLoading && <Alert severity="info">Loading the quiz</Alert>}
      {quizQuery.isError && (
        <Alert severity="error">Could not load the quiz</Alert>
      )}
      {quizQuery.isSuccess && (
        <>
          {questions.length === 0 ? (
            <Box>
              <Alert severity="warning">This quiz does not exist 😮</Alert>
              <Box
                sx={{ marginTop: 4, display: 'flex', justifyContent: 'end' }}
              >
                <LinkButton
                  hrefObserver="/"
                  navigateOnClick
                  variant="contained"
                >
                  Home
                </LinkButton>
              </Box>
            </Box>
          ) : (
            <>
              {!gameDone && (
                <Card>
                  <CardContent sx={{ padding: 0 }}>
                    <Typography
                      variant="h4"
                      component="h1"
                      sx={{
                        margin: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="inherit" component="span">
                        {question.attributes?.title}
                      </Typography>
                      <ScoreProgress progress={scoreProgress} />
                    </Typography>
                    <List disablePadding>
                      {question.attributes?.answers?.data.map((answer) => (
                        <ListItem
                          key={answer.id}
                          disableGutters
                          onClick={() =>
                            handleAnswerClick(
                              answer.attributes?.correct ?? false
                            )
                          }
                        >
                          <ListItemButton
                            sx={{ fontSize: '1.2rem', paddingInline: 6 }}
                          >
                            <ListItemText>
                              {answer.attributes?.title}
                            </ListItemText>
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
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
                    <Typography variant="h1">
                      <GradientWord>Summary</GradientWord>
                    </Typography>
                    <Typography>
                      {`You got ${
                        scoreProgress.filter((score) => score === 'correct')
                          .length
                      } out of ${questions.length} answers correct!`}
                    </Typography>
                    <Box sx={{ marginTop: 4 }}>
                      {questions.map((question) => (
                        <Box key={question.id}>
                          <Typography
                            variant="h5"
                            component="h2"
                            sx={{ marginTop: 2, marginBottom: 0 }}
                          >
                            {question.attributes?.title}
                          </Typography>
                          <List dense>
                            {question.attributes?.answers?.data.map(
                              (answer) => (
                                <ListItem key={answer.id}>
                                  <ListItemIcon>
                                    {answer.attributes?.correct ? (
                                      <CheckIcon color="success" />
                                    ) : null}
                                  </ListItemIcon>
                                  <ListItemText>
                                    <Typography>
                                      {answer.attributes?.title}
                                    </Typography>
                                  </ListItemText>
                                </ListItem>
                              )
                            )}
                          </List>
                        </Box>
                      ))}
                    </Box>
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
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps<{
  gameId: string;
}> = async (ctx) => {
  const id = ctx.params?.id;
  if (typeof id !== 'string') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      gameId: id,
    },
  };
};
