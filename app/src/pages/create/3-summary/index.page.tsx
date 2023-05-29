import GradientWord from '@/components/GradientWord';
import LinkButton from '@/components/LinkButton';
import {
  createAnswerGQL,
  createQuestionGQL,
  createQuizGQL,
} from '@/graphql/createQuiz';
import {
  AnswerInput,
  QuestionInput,
  QuizInput,
} from '@/graphql/generated/graphql';
import { useQuizDraft } from '@/stores/quiz-draft.store';
import {
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Divider,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import request from 'graphql-request';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { shallow } from 'zustand/shallow';

export default function CreateQuizSummaryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    title: quizTitle,
    description: quizDescription,
    questions,
    clearDraft,
  } = useQuizDraft(
    (state) => ({
      title: state.title,
      description: state.description,
      questions: state.questions,
      clearDraft: state.clearDraft,
    }),
    shallow
  );

  const createQuizMutation = useMutation({
    mutationKey: ['createQuiz'],
    mutationFn: (data: QuizInput) =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        createQuizGQL,
        {
          data,
        },
        {
          Authorization: `Bearer ${session?.user.acessToken}`,
        }
      ),
    onSuccess: async (data) => {
      try {
        // Create questions
        await Promise.all(
          questions.map(async (question) => {
            const questionData = await createQuestionMutation.mutateAsync({
              title: question.title,
              quiz: data.createQuiz?.data?.id,
            });

            // Create answers
            await Promise.all(
              question.answers.map(async (answer) => {
                await createAnswerMutation.mutateAsync({
                  title: answer.text,
                  correct: answer.isCorrect,
                  question: questionData.createQuestion?.data?.id,
                });
              })
            );
          })
        );
        router.push('/');
        clearDraft();
      } catch (error) {
        console.error(error);
      }
    },
  });
  const createQuestionMutation = useMutation({
    mutationKey: ['createQuestion'],
    mutationFn: (data: QuestionInput) =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        createQuestionGQL,
        {
          data,
        },
        {
          Authorization: `Bearer ${session?.user.acessToken}`,
        }
      ),
  });
  const createAnswerMutation = useMutation({
    mutationKey: ['createAnswer'],
    mutationFn: (data: AnswerInput) =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        createAnswerGQL,
        {
          data,
        },
        {
          Authorization: `Bearer ${session?.user.acessToken}`,
        }
      ),
  });

  function handleFinishQuizClick() {
    // Create quiz
    createQuizMutation.mutate({
      title: quizTitle,
      description: quizDescription,
      published: true,
      owner: session?.user?.id?.toString() ?? '0',
    });
  }

  if (status === 'unauthenticated') return null;

  return (
    <Box>
      <Typography variant="h1">
        <span>The </span>
        <GradientWord>summary</GradientWord>
        <span>.</span>
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h3" component="h2">
            {quizTitle}
          </Typography>
          <Typography variant="body1">{quizDescription}</Typography>
          <List>
            {questions.map((question, qIndex) => (
              <>
                {qIndex > 0 && <Divider />}
                <ListItem key={`question-${qIndex}`}>
                  <Box>
                    <Typography variant="h5" component="h3">{`${qIndex + 1}) ${
                      question.title
                    }`}</Typography>
                    <List>
                      {question.answers.map((answer, aIndex) => (
                        <ListItem
                          key={`question-${aIndex}-answer-${aIndex}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            columnGap: 3,
                          }}
                        >
                          {answer.isCorrect ? (
                            <CheckIcon color="success" />
                          ) : (
                            <ClearIcon color="error" />
                          )}
                          <Box>{answer.text}</Box>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </ListItem>
              </>
            ))}
          </List>
        </CardContent>
        <CardActions
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            margin: 1,
          }}
          disableSpacing
        >
          <LinkButton
            hrefObserver="/create/2-questions"
            navigateOnClick
            variant="outlined"
            iconSide="right"
            startIcon={<ArrowBackIcon />}
          >
            Edit questions
          </LinkButton>
          <LinkButton
            hrefObserver="/"
            onClick={handleFinishQuizClick}
            sx={{ marginLeft: 'auto' }}
            variant="contained"
          >
            Finish quiz
          </LinkButton>
        </CardActions>
      </Card>
    </Box>
  );
}
