export type AnswerForm = {
  id?: string;
  title: string;
  isCorrect: boolean;
};

export type QuestionForm = {
  id?: string;
  title: string;
  answers: AnswerForm[];
};

export type QuizForm = {
  id?: string;
  title: string;
  description: string;
  image: string;
  questions: QuestionForm[];
};

export const defaultAnswerFormData: AnswerForm = {
  title: '',
  isCorrect: false,
};

export const defaultQuestionFormData: QuestionForm = {
  title: '',
  answers: Array.from({ length: 4 }, () => defaultAnswerFormData),
};

export const defaultQuizFormData: QuizForm = {
  title: '',
  description: '',
  image: '',
  questions: [defaultQuestionFormData],
};
