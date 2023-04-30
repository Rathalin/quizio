import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { graphql } from '../generated/gql';

const myQuizsOverviewOfOwner = graphql(`
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

export function useMyQuizsOverviewQuery(ownerId: string) {
  return useQuery({
    queryKey: ['myQuizs'],
    queryFn: () =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
        myQuizsOverviewOfOwner,
        {
          ownerId,
        }
      ),
  });
}
