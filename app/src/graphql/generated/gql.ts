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
  '\n  query alerts {\n    alerts {\n      data {\n        id\n        attributes {\n          content\n          image {\n            data {\n              id\n              attributes {\n                alternativeText\n                url\n              }\n            }\n          }\n          imageSize\n          severity\n        }\n      }\n    }\n  }\n':
    types.AlertsDocument,
  '\n  mutation changePassword(\n    $currentPassword: String!\n    $password: String!\n    $passwordConfirmation: String!\n  ) {\n    changePassword(\n      currentPassword: $currentPassword\n      password: $password\n      passwordConfirmation: $passwordConfirmation\n    ) {\n      jwt\n    }\n  }\n':
    types.ChangePasswordDocument,
  '\n  mutation createQuiz($data: QuizInput!) {\n    createQuiz(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n':
    types.CreateQuizDocument,
  '\n  mutation createQuestion($data: QuestionInput!) {\n    createQuestion(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n':
    types.CreateQuestionDocument,
  '\n  mutation createAnswer($data: AnswerInput!) {\n    createAnswer(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n':
    types.CreateAnswerDocument,
  '\n  mutation updateQuiz($id: ID!, $data: QuizInput!) {\n    updateQuiz(id: $id, data: $data) {\n      data {\n        id\n      }\n    }\n  }\n':
    types.UpdateQuizDocument,
  '\n  mutation updateQuestion($id: ID!, $data: QuestionInput!) {\n    updateQuestion(id: $id, data: $data) {\n      data {\n        id\n      }\n    }\n  }\n':
    types.UpdateQuestionDocument,
  '\n  mutation updateAnswer($id: ID!, $data: AnswerInput!) {\n    updateAnswer(id: $id, data: $data) {\n      data {\n        id\n      }\n    }\n  }\n':
    types.UpdateAnswerDocument,
  '\n  mutation deleteQuiz($id: ID!) {\n    deleteQuiz(id: $id) {\n      data {\n        id\n      }\n    }\n  }\n':
    types.DeleteQuizDocument,
  '\n  mutation deleteQuestion($id: ID!) {\n    deleteQuestion(id: $id) {\n      data {\n        id\n      }\n    }\n  }\n':
    types.DeleteQuestionDocument,
  '\n  mutation deleteAnswer($id: ID!) {\n    deleteAnswer(id: $id) {\n      data {\n        id\n      }\n    }\n  }\n':
    types.DeleteAnswerDocument,
  '\n  query getMyQuizsOverviewsOfOwner($ownerId: ID!) {\n    quizzes(filters: { owner: { id: { eq: $ownerId } } }) {\n      data {\n        id\n        attributes {\n          title\n          description\n          published\n          questions {\n            data {\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.GetMyQuizsOverviewsOfOwnerDocument,
  '\n  query getMyQuizzesByUuid($uuid: String!, $ownerId: ID!) {\n    quizzes(filters: { uuid: { eq: $uuid }, owner: { id: { eq: $ownerId } } }) {\n      data {\n        id\n        attributes {\n          title\n          description\n          questions(pagination: { limit: 100 }) {\n            data {\n              id\n              attributes {\n                title\n                answers(pagination: { limit: 100 }) {\n                  data {\n                    id\n                    attributes {\n                      title\n                      correct\n                    }\n                  }\n                }\n                explanation\n              }\n            }\n          }\n          image {\n            data {\n              id\n              attributes {\n                url\n                name\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.GetMyQuizzesByUuidDocument,
  '\n  query getPlayCountOfQuiz($quizId: ID!) {\n    quiz(id: $quizId) {\n      data {\n        attributes {\n          playCount\n        }\n      }\n    }\n  }\n':
    types.GetPlayCountOfQuizDocument,
  '\n  mutation updatePlayCountOfQuiz($quizId: ID!, $playCount: Int!) {\n    updateQuiz(id: $quizId, data: { playCount: $playCount }) {\n      data {\n        attributes {\n          playCount\n        }\n      }\n    }\n  }\n':
    types.UpdatePlayCountOfQuizDocument,
  '\n  query getAllPublishedQuizzes(\n    $sortFields: [String]\n    $filters: QuizFiltersInput!\n  ) {\n    quizzes(filters: $filters, sort: $sortFields, pagination: { limit: 100 }) {\n      data {\n        id\n        attributes {\n          uuid\n          title\n          description\n          published\n          createdAt\n          playCount\n          questions(pagination: { limit: 100 }) {\n            data {\n              id\n            }\n          }\n          image {\n            data {\n              id\n              attributes {\n                url\n              }\n            }\n          }\n          owner {\n            data {\n              id\n              attributes {\n                username\n                uuid\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.GetAllPublishedQuizzesDocument,
  '\n  query getQuizzesByUuid($uuid: String!) {\n    quizzes(filters: { uuid: { eq: $uuid } }) {\n      data {\n        id\n        attributes {\n          title\n          questions(pagination: { limit: 100 }) {\n            data {\n              id\n              attributes {\n                title\n                answers(pagination: { limit: 10 }) {\n                  data {\n                    id\n                    attributes {\n                      title\n                      correct\n                    }\n                  }\n                }\n                explanation\n              }\n            }\n          }\n          image {\n            data {\n              id\n              attributes {\n                url\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.GetQuizzesByUuidDocument,
  '\n  query getUsersByUuid($uuid: String!) {\n    usersPermissionsUsers(filters: { uuid: { eq: $uuid } }) {\n      data {\n        id\n      }\n    }\n  }\n':
    types.GetUsersByUuidDocument,
  '\n  query getMe {\n    me {\n      id\n      username\n      email\n      role {\n        id\n        name\n      }\n    }\n  }\n':
    types.GetMeDocument,
  '\n  query getUserProfileDataById($userId: ID!) {\n    usersPermissionsUser(id: $userId) {\n      data {\n        id\n        attributes {\n          username\n          uuid\n          email\n          role {\n            data {\n              attributes {\n                name\n              }\n            }\n          }\n          createdAt\n          quizzes {\n            data {\n              id\n              attributes {\n                createdAt\n                playCount\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.GetUserProfileDataByIdDocument,
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
export function graphql(
  source: '\n  query alerts {\n    alerts {\n      data {\n        id\n        attributes {\n          content\n          image {\n            data {\n              id\n              attributes {\n                alternativeText\n                url\n              }\n            }\n          }\n          imageSize\n          severity\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query alerts {\n    alerts {\n      data {\n        id\n        attributes {\n          content\n          image {\n            data {\n              id\n              attributes {\n                alternativeText\n                url\n              }\n            }\n          }\n          imageSize\n          severity\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation changePassword(\n    $currentPassword: String!\n    $password: String!\n    $passwordConfirmation: String!\n  ) {\n    changePassword(\n      currentPassword: $currentPassword\n      password: $password\n      passwordConfirmation: $passwordConfirmation\n    ) {\n      jwt\n    }\n  }\n'
): (typeof documents)['\n  mutation changePassword(\n    $currentPassword: String!\n    $password: String!\n    $passwordConfirmation: String!\n  ) {\n    changePassword(\n      currentPassword: $currentPassword\n      password: $password\n      passwordConfirmation: $passwordConfirmation\n    ) {\n      jwt\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createQuiz($data: QuizInput!) {\n    createQuiz(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation createQuiz($data: QuizInput!) {\n    createQuiz(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createQuestion($data: QuestionInput!) {\n    createQuestion(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation createQuestion($data: QuestionInput!) {\n    createQuestion(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createAnswer($data: AnswerInput!) {\n    createAnswer(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation createAnswer($data: AnswerInput!) {\n    createAnswer(data: $data) {\n      data {\n        id\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation updateQuiz($id: ID!, $data: QuizInput!) {\n    updateQuiz(id: $id, data: $data) {\n      data {\n        id\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation updateQuiz($id: ID!, $data: QuizInput!) {\n    updateQuiz(id: $id, data: $data) {\n      data {\n        id\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation updateQuestion($id: ID!, $data: QuestionInput!) {\n    updateQuestion(id: $id, data: $data) {\n      data {\n        id\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation updateQuestion($id: ID!, $data: QuestionInput!) {\n    updateQuestion(id: $id, data: $data) {\n      data {\n        id\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation updateAnswer($id: ID!, $data: AnswerInput!) {\n    updateAnswer(id: $id, data: $data) {\n      data {\n        id\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation updateAnswer($id: ID!, $data: AnswerInput!) {\n    updateAnswer(id: $id, data: $data) {\n      data {\n        id\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation deleteQuiz($id: ID!) {\n    deleteQuiz(id: $id) {\n      data {\n        id\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation deleteQuiz($id: ID!) {\n    deleteQuiz(id: $id) {\n      data {\n        id\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation deleteQuestion($id: ID!) {\n    deleteQuestion(id: $id) {\n      data {\n        id\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation deleteQuestion($id: ID!) {\n    deleteQuestion(id: $id) {\n      data {\n        id\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation deleteAnswer($id: ID!) {\n    deleteAnswer(id: $id) {\n      data {\n        id\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation deleteAnswer($id: ID!) {\n    deleteAnswer(id: $id) {\n      data {\n        id\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getMyQuizsOverviewsOfOwner($ownerId: ID!) {\n    quizzes(filters: { owner: { id: { eq: $ownerId } } }) {\n      data {\n        id\n        attributes {\n          title\n          description\n          published\n          questions {\n            data {\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getMyQuizsOverviewsOfOwner($ownerId: ID!) {\n    quizzes(filters: { owner: { id: { eq: $ownerId } } }) {\n      data {\n        id\n        attributes {\n          title\n          description\n          published\n          questions {\n            data {\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getMyQuizzesByUuid($uuid: String!, $ownerId: ID!) {\n    quizzes(filters: { uuid: { eq: $uuid }, owner: { id: { eq: $ownerId } } }) {\n      data {\n        id\n        attributes {\n          title\n          description\n          questions(pagination: { limit: 100 }) {\n            data {\n              id\n              attributes {\n                title\n                answers(pagination: { limit: 100 }) {\n                  data {\n                    id\n                    attributes {\n                      title\n                      correct\n                    }\n                  }\n                }\n                explanation\n              }\n            }\n          }\n          image {\n            data {\n              id\n              attributes {\n                url\n                name\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getMyQuizzesByUuid($uuid: String!, $ownerId: ID!) {\n    quizzes(filters: { uuid: { eq: $uuid }, owner: { id: { eq: $ownerId } } }) {\n      data {\n        id\n        attributes {\n          title\n          description\n          questions(pagination: { limit: 100 }) {\n            data {\n              id\n              attributes {\n                title\n                answers(pagination: { limit: 100 }) {\n                  data {\n                    id\n                    attributes {\n                      title\n                      correct\n                    }\n                  }\n                }\n                explanation\n              }\n            }\n          }\n          image {\n            data {\n              id\n              attributes {\n                url\n                name\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getPlayCountOfQuiz($quizId: ID!) {\n    quiz(id: $quizId) {\n      data {\n        attributes {\n          playCount\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getPlayCountOfQuiz($quizId: ID!) {\n    quiz(id: $quizId) {\n      data {\n        attributes {\n          playCount\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation updatePlayCountOfQuiz($quizId: ID!, $playCount: Int!) {\n    updateQuiz(id: $quizId, data: { playCount: $playCount }) {\n      data {\n        attributes {\n          playCount\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation updatePlayCountOfQuiz($quizId: ID!, $playCount: Int!) {\n    updateQuiz(id: $quizId, data: { playCount: $playCount }) {\n      data {\n        attributes {\n          playCount\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAllPublishedQuizzes(\n    $sortFields: [String]\n    $filters: QuizFiltersInput!\n  ) {\n    quizzes(filters: $filters, sort: $sortFields, pagination: { limit: 100 }) {\n      data {\n        id\n        attributes {\n          uuid\n          title\n          description\n          published\n          createdAt\n          playCount\n          questions(pagination: { limit: 100 }) {\n            data {\n              id\n            }\n          }\n          image {\n            data {\n              id\n              attributes {\n                url\n              }\n            }\n          }\n          owner {\n            data {\n              id\n              attributes {\n                username\n                uuid\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getAllPublishedQuizzes(\n    $sortFields: [String]\n    $filters: QuizFiltersInput!\n  ) {\n    quizzes(filters: $filters, sort: $sortFields, pagination: { limit: 100 }) {\n      data {\n        id\n        attributes {\n          uuid\n          title\n          description\n          published\n          createdAt\n          playCount\n          questions(pagination: { limit: 100 }) {\n            data {\n              id\n            }\n          }\n          image {\n            data {\n              id\n              attributes {\n                url\n              }\n            }\n          }\n          owner {\n            data {\n              id\n              attributes {\n                username\n                uuid\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getQuizzesByUuid($uuid: String!) {\n    quizzes(filters: { uuid: { eq: $uuid } }) {\n      data {\n        id\n        attributes {\n          title\n          questions(pagination: { limit: 100 }) {\n            data {\n              id\n              attributes {\n                title\n                answers(pagination: { limit: 10 }) {\n                  data {\n                    id\n                    attributes {\n                      title\n                      correct\n                    }\n                  }\n                }\n                explanation\n              }\n            }\n          }\n          image {\n            data {\n              id\n              attributes {\n                url\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getQuizzesByUuid($uuid: String!) {\n    quizzes(filters: { uuid: { eq: $uuid } }) {\n      data {\n        id\n        attributes {\n          title\n          questions(pagination: { limit: 100 }) {\n            data {\n              id\n              attributes {\n                title\n                answers(pagination: { limit: 10 }) {\n                  data {\n                    id\n                    attributes {\n                      title\n                      correct\n                    }\n                  }\n                }\n                explanation\n              }\n            }\n          }\n          image {\n            data {\n              id\n              attributes {\n                url\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getUsersByUuid($uuid: String!) {\n    usersPermissionsUsers(filters: { uuid: { eq: $uuid } }) {\n      data {\n        id\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getUsersByUuid($uuid: String!) {\n    usersPermissionsUsers(filters: { uuid: { eq: $uuid } }) {\n      data {\n        id\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getMe {\n    me {\n      id\n      username\n      email\n      role {\n        id\n        name\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getMe {\n    me {\n      id\n      username\n      email\n      role {\n        id\n        name\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getUserProfileDataById($userId: ID!) {\n    usersPermissionsUser(id: $userId) {\n      data {\n        id\n        attributes {\n          username\n          uuid\n          email\n          role {\n            data {\n              attributes {\n                name\n              }\n            }\n          }\n          createdAt\n          quizzes {\n            data {\n              id\n              attributes {\n                createdAt\n                playCount\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getUserProfileDataById($userId: ID!) {\n    usersPermissionsUser(id: $userId) {\n      data {\n        id\n        attributes {\n          username\n          uuid\n          email\n          role {\n            data {\n              attributes {\n                name\n              }\n            }\n          }\n          createdAt\n          quizzes {\n            data {\n              id\n              attributes {\n                createdAt\n                playCount\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
