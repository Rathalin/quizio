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

export const deleteQuizGQL = graphql(`
  mutation deleteQuiz($id: ID!) {
    deleteQuiz(id: $id) {
      data {
        id
      }
    }
  }
`);

export const deleteQuestionGQL = graphql(`
  mutation deleteQuestion($id: ID!) {
    deleteQuestion(id: $id) {
      data {
        id
      }
    }
  }
`);

export const deleteAnswerGQL = graphql(`
  mutation deleteAnswer($id: ID!) {
    deleteAnswer(id: $id) {
      data {
        id
      }
    }
  }
`);
