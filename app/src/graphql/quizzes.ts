import { graphql } from './generated';

export const getAllPublishedQuizzesGQL = graphql(`
  query getAllPublishedQuizzes {
    quizzes(filters: { published: { eq: true } }, sort: "createdAt:DESC") {
      data {
        id
        attributes {
          uuid
          title
          description
          published
          createdAt
          playCount
          questions {
            data {
              id
            }
          }
          image {
            data {
              id
              attributes {
                url
              }
            }
          }
          owner {
            data {
              id
              attributes {
                username
              }
            }
          }
        }
      }
    }
  }
`);

export const getQuizzesByUuidGQL = graphql(`
  query getQuizzesByUuid($uuid: String!) {
    quizzes(filters: { uuid: { eq: $uuid } }) {
      data {
        id
        attributes {
          title
          questions(pagination: { limit: 100 }) {
            data {
              id
              attributes {
                title
                answers(pagination: { limit: 10 }) {
                  data {
                    id
                    attributes {
                      title
                      correct
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);
