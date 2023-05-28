import { graphql } from './generated/gql';

export const queryMe = graphql(`
  query me {
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
