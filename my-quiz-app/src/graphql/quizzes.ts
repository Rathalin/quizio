import { graphql } from './generated/gql';

export const queryAllPublishedQuizzes = graphql(`
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

export const queryQuizzesByUuid = graphql(`
  query getQuizzesByUuid($uuid: String!) {
    quizzes(filters: { uuid: { eq: $uuid } }) {
      data {
        id
        attributes {
          title
          questions {
            data {
              id
              attributes {
                title
                answers {
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
