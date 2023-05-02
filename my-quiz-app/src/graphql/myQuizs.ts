import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { graphql } from './generated/gql';

export const queryMyQuizsOverviewOfOwner = graphql(`
  query myQuizsOverviewsOfOwner($ownerId: ID!) {
    myQuizs(filters: { owner: { id: { eq: $ownerId } } }) {
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
