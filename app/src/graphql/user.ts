import { graphql } from './generated';

export const getMeGQL = graphql(`
  query getMe {
    me {
      id
      username
      email
      role {
        id
        name
      }
    }
  }
`);
