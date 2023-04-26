import { create } from 'zustand';

type QuizDraft = {
  title: string;
  description: string;
  questions: string[];
};

type QuizDraftState = {
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
