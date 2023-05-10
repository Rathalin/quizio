import { graphql } from './generated/gql';

export const queryAllPublishedQuizzes = graphql(`
  query allPublishedQuizzes {
    quizzes(filters: { published: { eq: true } }) {
      data {
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
  query queryQuizzesByUuid($uuid: String!) {
    quizzes(filters: { uuid: { eq: $uuid } }) {
      data {
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
