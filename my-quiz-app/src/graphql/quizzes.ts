import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { graphql } from './generated/gql';

export const queryAllPublishedQuizzes = graphql(`
  query allPublishedQuizzes {
    quizzes(filters: { published: { eq: true } }) {
      data {
        id
        attributes {
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
        }
      }
    }
  }
`);
