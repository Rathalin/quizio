import { graphql } from './generated';

export const healthCheckGql = graphql(`
  query gqlHealthCheck {
    me {
      id
    }
  }
`);
