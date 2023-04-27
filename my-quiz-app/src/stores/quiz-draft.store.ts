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
  // addQuestion: (question: QuestionDraft) => void;
  setQuestion: (question: QuestionDraft, index: number) => void;
  // removeQuestion: (index: number) => void;
  // addAnswer: (answer: AnswerDraft, questionIndex: number) => void;
  // setAnser: (answer: AnswerDraft, index: number, questionIndex: number) => void;
  // removeAnswer: (index: number, questionIndex: number) => void;
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
  setQuestion: (question, index) =>
    set((state) => {
      const questions = [...state.questions];
      questions[index] = question;
      return { questions };
    }),
}));
