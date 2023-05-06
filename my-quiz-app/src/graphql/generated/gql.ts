/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query myQuizsOverviewsOfOwner($ownerId: ID!) {\n    quizzes(filters: { owner: { id: { eq: $ownerId } } }) {\n      data {\n        id\n        attributes {\n          title\n          description\n          published\n          questions {\n            data {\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n": types.MyQuizsOverviewsOfOwnerDocument,
    "\n  query allPublishedQuizzes {\n    quizzes(filters: { published: { eq: true } }) {\n      data {\n        attributes {\n          uuid\n          title\n          description\n          published\n          createdAt\n          questions {\n            data {\n              id\n            }\n          }\n          image {\n            data {\n              id\n              attributes {\n                url\n              }\n            }\n          }\n          owner {\n            data {\n              id\n              attributes {\n                username\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.AllPublishedQuizzesDocument,
    "\n  query queryQuizzesByUuid($uuid: String!) {\n    quizzes(filters: { uuid: { eq: $uuid } }) {\n      data {\n        attributes {\n          questions {\n            data {\n              id\n              attributes {\n                title\n                answers {\n                  data {\n                    id\n                    attributes {\n                      title\n                      correct\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.QueryQuizzesByUuidDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query myQuizsOverviewsOfOwner($ownerId: ID!) {\n    quizzes(filters: { owner: { id: { eq: $ownerId } } }) {\n      data {\n        id\n        attributes {\n          title\n          description\n          published\n          questions {\n            data {\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query myQuizsOverviewsOfOwner($ownerId: ID!) {\n    quizzes(filters: { owner: { id: { eq: $ownerId } } }) {\n      data {\n        id\n        attributes {\n          title\n          description\n          published\n          questions {\n            data {\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query allPublishedQuizzes {\n    quizzes(filters: { published: { eq: true } }) {\n      data {\n        attributes {\n          uuid\n          title\n          description\n          published\n          createdAt\n          questions {\n            data {\n              id\n            }\n          }\n          image {\n            data {\n              id\n              attributes {\n                url\n              }\n            }\n          }\n          owner {\n            data {\n              id\n              attributes {\n                username\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query allPublishedQuizzes {\n    quizzes(filters: { published: { eq: true } }) {\n      data {\n        attributes {\n          uuid\n          title\n          description\n          published\n          createdAt\n          questions {\n            data {\n              id\n            }\n          }\n          image {\n            data {\n              id\n              attributes {\n                url\n              }\n            }\n          }\n          owner {\n            data {\n              id\n              attributes {\n                username\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query queryQuizzesByUuid($uuid: String!) {\n    quizzes(filters: { uuid: { eq: $uuid } }) {\n      data {\n        attributes {\n          questions {\n            data {\n              id\n              attributes {\n                title\n                answers {\n                  data {\n                    id\n                    attributes {\n                      title\n                      correct\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query queryQuizzesByUuid($uuid: String!) {\n    quizzes(filters: { uuid: { eq: $uuid } }) {\n      data {\n        attributes {\n          questions {\n            data {\n              id\n              attributes {\n                title\n                answers {\n                  data {\n                    id\n                    attributes {\n                      title\n                      correct\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;