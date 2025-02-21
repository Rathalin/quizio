import { useAllowedFileTypesQuery } from '@/data/useAllowedFileTypesQuery';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { z } from 'zod';

export const constraints = {
  quiz: {
    title: {
      minLength: 1,
      maxLength: 50,
    },
    description: {
      maxLength: 200,
    },
    question: {
      title: {
        minLength: 1,
        maxLength: 200,
      },
      explanation: {
        maxLength: 400,
      },
    },
    answer: {
      title: {
        minLength: 1,
        maxLength: 100,
      },
    },
  },
  user: {
    password: {
      minLength: 6,
      maxLength: 50,
    },
  },
} as const;

export function useQuizOverviewFormSchema() {
  const t = useTranslations('quizForm.form.schema.errorMessage');
  const validateFileType = useValidateFileType();

  return useMemo(
    () =>
      z.object({
        uuid: z.string().optional(),
        title: z
          .string()
          .trim()
          .min(constraints.quiz.title.minLength, t('title.minLength', { count: constraints.quiz.title.minLength }))
          .max(constraints.quiz.title.maxLength),
        description: z.string().trim().max(constraints.quiz.description.maxLength).optional(),
        image: z.object({
          data: z.object({
            file: z
              .any()
              .nullable()
              .refine((value) => validateFileType((value as File | null)?.type), {
                message: t('invalidFileType'),
                path: ['invalidImageFileType'],
              }),
          }),
          preview: z
            .object({
              url: z.string(),
            })
            .optional(),
        }),
      }),
    [t, validateFileType],
  );
}
export type QuizOverviewForm = z.infer<ReturnType<typeof useQuizOverviewFormSchema>>;

export const minQuestions = 1;
export const maxQuestions = 20;
export const minAnswers = 2;
export const maxAnswers = 12;

export function useQuizQuestionsFormSchema() {
  const t = useTranslations('quizForm.form.schema.errorMessage');
  const validateFileType = useValidateFileType();

  return useMemo(
    () =>
      z.object({
        questions: z
          .array(
            z.object({
              uuid: z.string().optional(),
              questionImage: z.object({
                data: z.object({
                  file: z
                    .any()
                    .nullable()
                    .refine((value) => validateFileType((value as File | null)?.type), {
                      message: t('invalidFileType'),
                      path: ['invalidImageFileType'],
                    }),
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
                  file: z
                    .any()
                    .nullable()
                    .refine((value) => validateFileType((value as File | null)?.type), {
                      message: t('invalidFileType'),
                      path: ['invalidImageFileType'],
                    }),
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
    [t, validateFileType],
  );
}
export type QuizQuestionsForm = z.infer<ReturnType<typeof useQuizQuestionsFormSchema>>;
export type AnswerForm = QuizQuestionsForm['questions'][number]['answers'][number];

function useValidateFileType() {
  const { data: allowedFileTypes } = useAllowedFileTypesQuery();
  return useCallback(
    (fileType?: string) => {
      if (allowedFileTypes == null || fileType == null) {
        return true;
      }
      return allowedFileTypes.allowedImageFileTypes.includes(fileType.replace('image/', ''));
    },
    [allowedFileTypes],
  );
}
