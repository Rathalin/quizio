import { create } from 'zustand';

export type AnswerDraft = {
  text: string;
  correct: boolean;
};

export type QuestionDraft = {
  title: string;
  answers: AnswerDraft[];
};

export type QuizDraft = {
  title: string;
  description: string;
  questions: QuestionDraft[];
};

export type QuizDraftState = {
  draft: QuizDraft;
  setDraft: (draft: QuizDraft) => void;
};

export const useQuizDraft = create<QuizDraftState>()((set) => ({
  draft: {
    title: '',
    description: '',
    questions: [],
  },
  setDraft: (draft) => set({ draft }),
}));
