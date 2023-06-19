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
    "\n  mutation createQuiz($data: QuizInput!) {\n    createQuiz(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n": types.CreateQuizDocument,
    "\n  mutation createQuestion($data: QuestionInput!) {\n    createQuestion(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n": types.CreateQuestionDocument,
    "\n  mutation createAnswer($data: AnswerInput!) {\n    createAnswer(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n": types.CreateAnswerDocument,
    "\n  query getMyQuizsOverviewsOfOwner($ownerId: ID!) {\n    quizzes(filters: { owner: { id: { eq: $ownerId } } }) {\n      data {\n        id\n        attributes {\n          title\n          description\n          published\n          questions {\n            data {\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n": types.GetMyQuizsOverviewsOfOwnerDocument,
    "\n  query getPlayCountOfQuiz($quizId: ID!) {\n    quiz(id: $quizId) {\n      data {\n        attributes {\n          playCount\n        }\n      }\n    }\n  }\n": types.GetPlayCountOfQuizDocument,
    "\n  mutation updatePlayCountOfQuiz($quizId: ID!, $playCount: Int!) {\n    updateQuiz(id: $quizId, data: { playCount: $playCount }) {\n      data {\n        attributes {\n          playCount\n        }\n      }\n    }\n  }\n": types.UpdatePlayCountOfQuizDocument,
    "\n  query getAllPublishedQuizzes {\n    quizzes(filters: { published: { eq: true } }, sort: \"createdAt:DESC\") {\n      data {\n        id\n        attributes {\n          uuid\n          title\n          description\n          published\n          createdAt\n          playCount\n          questions {\n            data {\n              id\n            }\n          }\n          image {\n            data {\n              id\n              attributes {\n                url\n              }\n            }\n          }\n          owner {\n            data {\n              id\n              attributes {\n                username\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.GetAllPublishedQuizzesDocument,
    "\n  query getQuizzesByUuid($uuid: String!) {\n    quizzes(filters: { uuid: { eq: $uuid } }) {\n      data {\n        id\n        attributes {\n          title\n          questions {\n            data {\n              id\n              attributes {\n                title\n                answers {\n                  data {\n                    id\n                    attributes {\n                      title\n                      correct\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.GetQuizzesByUuidDocument,
    "\n  mutation UploadImage($file: Upload!) {\n    upload(file: $file) {\n      data {\n        id\n        attributes {\n          name\n        }\n      }\n    }\n  }\n": types.UploadImageDocument,
    "\n  query getMe {\n    me {\n      id\n      username\n      email\n      role {\n        id\n        name\n      }\n    }\n  }\n": types.GetMeDocument,
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
export function graphql(source: "\n  mutation createQuiz($data: QuizInput!) {\n    createQuiz(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation createQuiz($data: QuizInput!) {\n    createQuiz(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createQuestion($data: QuestionInput!) {\n    createQuestion(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation createQuestion($data: QuestionInput!) {\n    createQuestion(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createAnswer($data: AnswerInput!) {\n    createAnswer(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation createAnswer($data: AnswerInput!) {\n    createAnswer(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getMyQuizsOverviewsOfOwner($ownerId: ID!) {\n    quizzes(filters: { owner: { id: { eq: $ownerId } } }) {\n      data {\n        id\n        attributes {\n          title\n          description\n          published\n          questions {\n            data {\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query getMyQuizsOverviewsOfOwner($ownerId: ID!) {\n    quizzes(filters: { owner: { id: { eq: $ownerId } } }) {\n      data {\n        id\n        attributes {\n          title\n          description\n          published\n          questions {\n            data {\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getPlayCountOfQuiz($quizId: ID!) {\n    quiz(id: $quizId) {\n      data {\n        attributes {\n          playCount\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query getPlayCountOfQuiz($quizId: ID!) {\n    quiz(id: $quizId) {\n      data {\n        attributes {\n          playCount\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation updatePlayCountOfQuiz($quizId: ID!, $playCount: Int!) {\n    updateQuiz(id: $quizId, data: { playCount: $playCount }) {\n      data {\n        attributes {\n          playCount\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation updatePlayCountOfQuiz($quizId: ID!, $playCount: Int!) {\n    updateQuiz(id: $quizId, data: { playCount: $playCount }) {\n      data {\n        attributes {\n          playCount\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getAllPublishedQuizzes {\n    quizzes(filters: { published: { eq: true } }, sort: \"createdAt:DESC\") {\n      data {\n        id\n        attributes {\n          uuid\n          title\n          description\n          published\n          createdAt\n          playCount\n          questions {\n            data {\n              id\n            }\n          }\n          image {\n            data {\n              id\n              attributes {\n                url\n              }\n            }\n          }\n          owner {\n            data {\n              id\n              attributes {\n                username\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query getAllPublishedQuizzes {\n    quizzes(filters: { published: { eq: true } }, sort: \"createdAt:DESC\") {\n      data {\n        id\n        attributes {\n          uuid\n          title\n          description\n          published\n          createdAt\n          playCount\n          questions {\n            data {\n              id\n            }\n          }\n          image {\n            data {\n              id\n              attributes {\n                url\n              }\n            }\n          }\n          owner {\n            data {\n              id\n              attributes {\n                username\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getQuizzesByUuid($uuid: String!) {\n    quizzes(filters: { uuid: { eq: $uuid } }) {\n      data {\n        id\n        attributes {\n          title\n          questions {\n            data {\n              id\n              attributes {\n                title\n                answers {\n                  data {\n                    id\n                    attributes {\n                      title\n                      correct\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query getQuizzesByUuid($uuid: String!) {\n    quizzes(filters: { uuid: { eq: $uuid } }) {\n      data {\n        id\n        attributes {\n          title\n          questions {\n            data {\n              id\n              attributes {\n                title\n                answers {\n                  data {\n                    id\n                    attributes {\n                      title\n                      correct\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UploadImage($file: Upload!) {\n    upload(file: $file) {\n      data {\n        id\n        attributes {\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UploadImage($file: Upload!) {\n    upload(file: $file) {\n      data {\n        id\n        attributes {\n          name\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getMe {\n    me {\n      id\n      username\n      email\n      role {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query getMe {\n    me {\n      id\n      username\n      email\n      role {\n        id\n        name\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;