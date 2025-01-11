import createClient from 'openapi-fetch';
import { paths, components } from './schema';

export const client = createClient<paths>({ baseUrl: 'http://localhost:8080' });

type ApiSchemas = components['schemas'];

export type Question = ApiSchemas['ModelsQuestion'];
export type Answer = ApiSchemas['ModelsAnswer'];
export type Meta = ApiSchemas['ModelsMeta'];
export type User = ApiSchemas['ModelsUserAccount'];

type WithResponse<T> = T & { response: Response };
type ApiCall = (
  ...args: any[]
) => Promise<
  WithResponse<{ data: any; error?: never } | { data?: never; error: any }>
>;
export type InferFetchResult<TFunc extends ApiCall> = NonNullable<
  Awaited<ReturnType<TFunc>>['data']
>;
export type InferFetchError<TFunc extends ApiCall> = NonNullable<
  Awaited<ReturnType<TFunc>>['error']
>;

export async function throwOnError<TFunc extends ApiCall>(
  apiCall: TFunc
): Promise<NonNullable<Awaited<ReturnType<TFunc>>['data']>> {
  const { data, error } = await apiCall();
  if (error != null) {
    throw error;
  }
  return data;
}
