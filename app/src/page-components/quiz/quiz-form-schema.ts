import { constraints } from '@/content-type-utilities/content-type-constraints';
import { z } from 'zod';

function minLengthError(field: string, minLength: number) {
  return `${field} must be at least ${minLength} character(s) long`;
}

export const quizOverviewFormSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .trim()
    .min(
      constraints.quiz.title.minLength,
      minLengthError('Title', constraints.quiz.title.minLength)
    )
    .max(constraints.quiz.title.maxLength),
  description: z
    .string()
    .trim()
    .max(constraints.quiz.description.maxLength)
    .optional(),
  image: z.instanceof(File).nullable(),
});
export type QuizOverviewForm = z.infer<typeof quizOverviewFormSchema>;

export const minQuestions = 1;
export const maxQuestions = 20;
export const minAnswers = 2;
export const maxAnswers = 20;
export const quizQuestionsFormSchema = z.object({
  questions: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z
          .string()
          .trim()
          .min(
            constraints.quiz.question.title.minLength,
            minLengthError('Question', constraints.quiz.title.minLength)
          )
          .max(constraints.quiz.question.title.maxLength),
        answers: z
          .array(
            z.object({
              id: z.string().optional(),
              title: z
                .string()
                .trim()
                .min(
                  constraints.quiz.answer.title.minLength,
                  minLengthError('Answer', constraints.quiz.title.minLength)
                )
                .max(constraints.quiz.answer.title.maxLength),
              isCorrect: z.boolean(),
            })
          )
          .min(minAnswers)
          .max(maxAnswers)
          .refine(
            (answers) =>
              answers.filter((answer) => answer.isCorrect).length === 1,
            {
              message: 'Exactly one answer must be correct',
              path: ['oneCorrectAnswer'],
            }
          ),
      })
    )
    .min(minQuestions)
    .max(maxQuestions),
});

export type QuizQuestionsForm = z.infer<typeof quizQuestionsFormSchema>;
export type AnswerForm =
  QuizQuestionsForm['questions'][number]['answers'][number];
