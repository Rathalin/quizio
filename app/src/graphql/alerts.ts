import { graphql } from './generated';

export const getAlertsGQL = graphql(`
  query alerts {
    alerts {
      data {
        id
        attributes {
          content
          image {
            data {
              id
              attributes {
                alternativeText
                url
              }
            }
          }
          imageSize
          severity
        }
      }
    }
  }
`);
