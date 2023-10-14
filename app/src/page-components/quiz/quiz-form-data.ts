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
  questionImage: {
    file: null,
  },
  answers: Array.from({ length: 4 }, () => defaultAnswerFormData),
  explanation: '',
  explanationImage: {
    file: null,
  },
};
export const defaultQuestionsFormData: QuizQuestionsForm = {
  questions: [defaultQuestionFormData],
};

export const defaultOverviewFormData: QuizOverviewForm = {
  title: '',
  description: '',
  image: {
    file: null,
  },
};
