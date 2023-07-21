import { graphql } from './generated';

export const getAllPublishedQuizzesGQL = graphql(`
  query getAllPublishedQuizzes(
    $sortFields: [String]
    $filters: QuizFiltersInput!
    $page: Int!
    $pageSize: Int!
  ) {
    quizzes(
      filters: $filters
      sort: $sortFields
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          uuid
          title
          description
          published
          createdAt
          playCount
          questions(pagination: { limit: 100 }) {
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
                uuid
              }
            }
          }
        }
      }
      meta {
        pagination {
          page
          pageSize
          pageCount
          total
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
                explanation
              }
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
        }
      }
    }
  }
`);
