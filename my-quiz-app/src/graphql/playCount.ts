import { graphql } from './generated/gql';

export const queryPlayCountOfQuiz = graphql(`
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

export const mutatePlayCountOfQuiz = graphql(`
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
