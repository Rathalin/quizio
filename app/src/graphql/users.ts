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

export const getUserProfileDataByIdGQL = graphql(`
  query getUserProfileDataById($userId: ID!) {
    usersPermissionsUser(id: $userId) {
      data {
        id
        attributes {
          username
          uuid
          email
          profileImage {
            data {
              id
              attributes {
                url
              }
            }
          }
          role {
            data {
              attributes {
                name
              }
            }
          }
          createdAt
          quizzes {
            data {
              id
              attributes {
                createdAt
                playCount
              }
            }
          }
        }
      }
    }
  }
`);
