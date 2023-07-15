import { graphql } from './generated';

export const getUsersByUuidGQL = graphql(`
  query getUsersByUuid($uuid: String!) {
    usersPermissionsUsers(filters: { uuid: { eq: $uuid } }) {
      data {
        id
      }
    }
  }
`);

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

export const getUserProfileStatsGQL = graphql(``);
