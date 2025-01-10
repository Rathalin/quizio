import createClient from 'openapi-fetch';
import { paths, components } from './schema';

export const client = createClient<paths>({ baseUrl: 'http://localhost:8080' });

type ApiSchemas = components['schemas'];

export type Quiz = ApiSchemas['ModelsQuiz'];
export type Question = ApiSchemas['ModelsQuestion'];
export type Answer = ApiSchemas['ModelsAnswer'];

type WithResponse<T> = T & { response: Response };

export type InferFetchResult<
  TFunc extends () => Promise<
    WithResponse<{ data: any; error?: never } | { data?: never; error: any }>
  >
> = NonNullable<Awaited<ReturnType<TFunc>>['data']>;
export type InferFetchError<
  TFunc extends () => Promise<
    WithResponse<{ data: any; error?: never } | { data?: never; error: any }>
  >
> = NonNullable<Awaited<ReturnType<TFunc>>['error']>;

export async function throwOnError<
  TFunc extends () => Promise<
    WithResponse<{ data: any; error?: never } | { data?: never; error: any }>
  >
>(apiCall: TFunc): Promise<NonNullable<Awaited<ReturnType<TFunc>>['data']>> {
  const { data, error } = await apiCall();
  if (error != null) {
    throw error;
  }
  return data;
}
