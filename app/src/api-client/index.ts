import createClient from 'openapi-fetch';
import { paths, components, operations } from './schema';

export const apiClient = createClient<paths>({ baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL });

type ApiSchemas = components['schemas'];

// Schemas
export type Quiz = ApiSchemas['HandlersGetQuizzesResponse']['quizzes'][number];
export type Question = ApiSchemas['ModelsQuestion'];
export type Answer = ApiSchemas['ModelsAnswer'];
export type Meta = ApiSchemas['ModelsMeta'];
export type User = ApiSchemas['ModelsUserAccount'];
export type CreateQuizRequestData = ApiSchemas['HandlersCreateQuizRequest'];
export type UpdateQuizRequestData = ApiSchemas['HandlersUpdateQuizRequest'];
export type UploadFileRequestData = ApiSchemas['HandlersUploadFileRequest'];
export type SignInResponse = ApiSchemas['HandlersSignInResponse'];
export type ChangePasswordReqest = ApiSchemas['HandlersChangePasswordRequest'];
export type UpdateQuizRequest = ApiSchemas['HandlersUpdateQuizRequest'];
export type UpdateUserProfileImageRequest = ApiSchemas['HandlersUpdateUserProfileImageRequest'];
export type GetMyQuizzesResponseQuiz = ApiSchemas['HandlersGetMyQuizzesResponseQuiz'];
export type PlayProtocolStatistic = ApiSchemas['HandlersGetMyQuizTrendsResponsePlayProtocolStatistic'];
export type PlayProtocolEntry = ApiSchemas['HandlersGetMyQuizTrendsResponsePlayProtocolEntry'];

// Operations
export type GetQuizzesRequestQuery = operations['backend/handlers.(*DBWrapper).GetQuizzes']['parameters']['query'];
export type GetMyQuizzesRequestQuery = operations['backend/handlers.(*DBWrapper).GetMyQuizzes']['parameters']['query'];
export type GetAlertsRequestQuery = operations['backend/handlers.(*DBWrapper).GetAlerts']['parameters']['query'];

type WithResponse<T> = T & { response: Response };
type ApiCall = (...args: any[]) => Promise<WithResponse<{ data: any; error?: never } | { data?: never; error: any }>>;
export type InferFetchResult<TFunc extends ApiCall> = NonNullable<Awaited<ReturnType<TFunc>>['data']>;
export type InferFetchError<TFunc extends ApiCall> = NonNullable<Awaited<ReturnType<TFunc>>['error']>;

export async function throwOnError<TFunc extends ApiCall>(
  apiCall: TFunc,
): Promise<NonNullable<Awaited<ReturnType<TFunc>>['data']>> {
  const { data, error } = await apiCall();
  if (error != null) {
    throw error;
  }
  return data;
}
