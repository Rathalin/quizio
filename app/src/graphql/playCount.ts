import { graphql } from './generated';

export const getPlayCountOfQuizGQL = graphql(`
  query getPlayCountOfQuiz($quizId: ID!) {
    quiz(id: $quizId) {
      data {
        attributes {
          playCount
        }
      }
    }
  }
`);

export const updatePlayCountOfQuizGQL = graphql(`
  mutation updatePlayCountOfQuiz($quizId: ID!, $playCount: Int!) {
    updateQuiz(id: $quizId, data: { playCount: $playCount }) {
      data {
        attributes {
          playCount
        }
      }
    }
  }
`);
