import { constraints } from '@/content-type-utilities/content-type-constraints';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { z } from 'zod';

function minLengthError(field: string, minLength: number) {
  return `${field} must be at least ${minLength} character(s) long`;
}

export const minQuestions = 1;
export const maxQuestions = 20;
export const minAnswers = 2;
export const maxAnswers = 12;
export function useQuizQuestionsFormSchema() {
  const t = useTranslations('quizForm.form.schema.errorMessage');

  return useMemo(
    () =>
      z.object({
        questions: z
          .array(
            z.object({
              uuid: z.string().optional(),
              questionImage: z.object({
                data: z.object({
                  file: z.any().nullable(),
                }),
                preview: z
                  .object({
                    url: z.string(),
                  })
                  .optional(),
              }),
              title: z
                .string()
                .trim()
                .min(
                  constraints.quiz.question.title.minLength,
                  t('question.title.minLength', { count: constraints.quiz.question.title.minLength }),
                )
                .max(constraints.quiz.question.title.maxLength),
              answers: z
                .array(
                  z.object({
                    uuid: z.string().optional(),
                    title: z
                      .string()
                      .trim()
                      .min(
                        constraints.quiz.answer.title.minLength,
                        t('answer.title.minLength', { count: constraints.quiz.answer.title.minLength }),
                      )
                      .max(constraints.quiz.answer.title.maxLength),
                    isCorrect: z.boolean(),
                  }),
                )
                .min(minAnswers)
                .max(maxAnswers)
                .refine((answers) => answers.filter((answer) => answer.isCorrect).length === 1, {
                  message: t('answer.exactlyOneCorrectAnswer'),
                  path: ['oneCorrectAnswer'],
                }),
              explanation: z.string().trim().max(constraints.quiz.question.explanation.maxLength).optional(),
              explanationImage: z.object({
                data: z.object({
                  file: z.any().nullable(),
                }),
                preview: z
                  .object({
                    url: z.string(),
                  })
                  .optional(),
              }),
            }),
          )
          .min(minQuestions)
          .max(maxQuestions),
      }),
    [t],
  );
}

export type QuizQuestionsForm = z.infer<ReturnType<typeof useQuizQuestionsFormSchema>>;

export const quizOverviewFormSchema = z.object({
  uuid: z.string().optional(),
  title: z
    .string()
    .trim()
    .min(constraints.quiz.title.minLength, minLengthError('Title', constraints.quiz.title.minLength))
    .max(constraints.quiz.title.maxLength),
  description: z.string().trim().max(constraints.quiz.description.maxLength).optional(),
  image: z.object({
    data: z.object({
      file: z.any().nullable(),
    }),
    preview: z
      .object({
        url: z.string(),
      })
      .optional(),
  }),
});
export type QuizOverviewForm = z.infer<typeof quizOverviewFormSchema>;
export type AnswerForm = QuizQuestionsForm['questions'][number]['answers'][number];
