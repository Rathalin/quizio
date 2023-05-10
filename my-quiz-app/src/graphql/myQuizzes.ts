import { graphql } from './generated/gql';

export const queryMyQuizzesOverviewOfOwner = graphql(`
  query myQuizsOverviewsOfOwner($ownerId: ID!) {
    quizzes(filters: { owner: { id: { eq: $ownerId } } }) {
      data {
        id
        attributes {
          title
          description
          published
          questions {
            data {
              id
            }
          }
        }
      }
    }
  }
`);
