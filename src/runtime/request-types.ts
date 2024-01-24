export interface GetRequest<TResponse> {
  url: string
  method: 'GET'
  headers?: Record<string, any>
}
export interface OptionsRequest<TResponse> {
  url: string
  method: 'OPTIONS'
  headers?: Record<string, any>
}
export interface DeleteRequest<TResponse> {
  url: string
  method: 'DELETE'
  headers?: Record<string, any>
}
export interface PostRequest<TRequest, TResponse> {
  data: TRequest
  url: string
  method: 'POST'
  headers?: Record<string, any>
}
export interface PatchRequest<TRequest, TResponse> {
  data: TRequest
  url: string
  method: 'PATCH'
  headers?: Record<string, any>
}
export interface PutRequest<TRequest, TResponse> {
  data: TRequest
  url: string
  method: 'PUT'
  headers?: Record<string, any>
}

export type AnyRequest<TResponse> =
  | PutRequest<any, TResponse>
  | PostRequest<any, TResponse>
  | GetRequest<TResponse>
  | DeleteRequest<TResponse>
  | OptionsRequest<TResponse>
  | PatchRequest<any, TResponse>
