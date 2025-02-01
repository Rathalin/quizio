import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export const stepTitles = ['details', 'questions', 'review'] as const;
export type StepData = {
  title: (typeof stepTitles)[number];
  backLabel?: string;
  nextLabel?: string;
};
export const steps = stepTitles.map((title, index) => ({
  title,
  backLabel: stepTitles[index - 1],
  nextLabel: stepTitles[index + 1],
}));

export function useQuizFormSteps(activeStep: number) {
  const t = useTranslations('quizForm.form.steps');

  const backLabel = useMemo(() => {
    const back = steps.at(activeStep)?.backLabel;
    if (back == null) {
      return null;
    }
    return t(back);
  }, [activeStep, t]);

  const nextLabel = useMemo(() => {
    const next = steps.at(activeStep)?.nextLabel;
    if (next == null) {
      return null;
    }
    return t(next);
  }, [activeStep, t]);

  return {
    backLabel,
    nextLabel,
  };
}
