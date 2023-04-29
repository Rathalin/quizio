import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { graphql } from '../generated/gql';

const allMyQuizsQuery = graphql(`
  query allMyQuizs {
    myQuizs {
      data {
        id
        attributes {
          title
          description
        }
      }
    }
  }
`);

export function useMyQuizsQuery() {
  return useQuery({
    queryKey: ['myQuizs'],
    queryFn: () => request('http://localhost:1337/graphql', allMyQuizsQuery),
  });
}
