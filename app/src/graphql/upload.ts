import { graphql } from './generated';

export const uploadImageGQL = graphql(`
  mutation UploadImage($file: Upload!) {
    upload(file: $file) {
      data {
        id
        attributes {
          name
        }
      }
    }
  }
`);
