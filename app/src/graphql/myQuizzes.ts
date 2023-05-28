import { graphql } from './generated';

export const getMyQuizzesOverviewOfOwnerGQL = graphql(`
  query getMyQuizsOverviewsOfOwner($ownerId: ID!) {
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
