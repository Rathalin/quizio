import { create } from 'zustand';

export type AnswerDraft = {
  text: string;
  isCorrect: boolean;
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
  clearDraft: () => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setQuestions: (questions: QuestionDraft[]) => void;
} & QuizDraft;

const defaultDraft: QuizDraft = {
  title: '',
  description: '',
  questions: [
    {
      title: '',
      answers: [
        {
          text: '',
          isCorrect: false,
        },
        {
          text: '',
          isCorrect: false,
        },
      ],
    },
  ],
};

export const useQuizDraft = create<QuizDraftState>()((set) => ({
  ...defaultDraft,
  clearDraft: () => set({ ...defaultDraft }),
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setQuestions: (questions) => set({ questions }),
}));
