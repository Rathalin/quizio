import {
  AnswerForm,
  QuizOverviewForm,
  QuizQuestionsForm,
} from './quiz-form-schema';

export const defaultAnswerFormData: AnswerForm = {
  title: '',
  isCorrect: false,
};

export const defaultQuestionFormData: QuizQuestionsForm['questions'][number] = {
  title: '',
  answers: Array.from({ length: 4 }, () => defaultAnswerFormData),
  explanation: '',
};
export const defaultQuestionsFormData: QuizQuestionsForm = {
  questions: [defaultQuestionFormData],
};

export const defaultOverviewFormData: QuizOverviewForm = {
  title: '',
  description: '',
  image: null,
};
