import { graphql } from './generated';

export const updateQuizGQL = graphql(`
  mutation updateQuiz($id: ID!, $data: QuizInput!) {
    updateQuiz(id: $id, data: $data) {
      data {
        id
      }
    }
  }
`);

export const updateQuestionGQL = graphql(`
  mutation updateQuestion($id: ID!, $data: QuestionInput!) {
    updateQuestion(id: $id, data: $data) {
      data {
        id
      }
    }
  }
`);

export const updateAnswerGQL = graphql(`
  mutation updateAnswer($id: ID!, $data: AnswerInput!) {
    updateAnswer(id: $id, data: $data) {
      data {
        id
      }
    }
  }
`);
