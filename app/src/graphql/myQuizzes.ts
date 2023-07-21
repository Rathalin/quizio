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

export const getMyQuizzesByUuidGQL = graphql(`
  query getMyQuizzesByUuid($uuid: String!, $ownerId: ID!) {
    quizzes(filters: { uuid: { eq: $uuid }, owner: { id: { eq: $ownerId } } }) {
      data {
        id
        attributes {
          title
          description
          questions(pagination: { limit: 100 }) {
            data {
              id
              attributes {
                title
                answers(pagination: { limit: 100 }) {
                  data {
                    id
                    attributes {
                      title
                      correct
                    }
                  }
                }
                explanation
              }
            }
          }
          image {
            data {
              id
              attributes {
                url
                name
              }
            }
          }
        }
      }
    }
  }
`);
