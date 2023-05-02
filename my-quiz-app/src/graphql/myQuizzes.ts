import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
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
