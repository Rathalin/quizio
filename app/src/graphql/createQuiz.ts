import { graphql } from './generated';

export const createQuizGQL = graphql(`
  mutation createQuiz($data: QuizInput!) {
    createQuiz(data: $data) {
      data {
        id
      }
    }
  }
`);

export const createQuestionGQL = graphql(`
  mutation createQuestion($data: QuestionInput!) {
    createQuestion(data: $data) {
      data {
        id
      }
    }
  }
`);

export const createAnswerGQL = graphql(`
  mutation createAnswer($data: AnswerInput!) {
    createAnswer(data: $data) {
      data {
        id
      }
    }
  }
`);
