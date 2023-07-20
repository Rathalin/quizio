const prefix = 'quizio';

export const storageKeys = {
  theme: `${prefix}-theme`,
  quizOverviewDraft: `${prefix}-quiz-overview-draft`,
  quizQuestionsDraft: `${prefix}-quiz-questions-draft`,
  sort: `${prefix}-sort`,
} as const;
