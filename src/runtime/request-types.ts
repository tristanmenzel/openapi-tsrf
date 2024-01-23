export interface GetRequest<TResponse> {
  url: string
  method: 'GET'
  headers?: Headers
}
export interface OptionsRequest<TResponse> {
  url: string
  method: 'OPTIONS'
  headers?: Headers
}
export interface DeleteRequest<TResponse> {
  url: string
  method: 'DELETE'
  headers?: Headers
}
export interface PostRequest<TRequest, TResponse> {
  data: TRequest
  url: string
  method: 'POST'
  headers?: Headers
}
export interface PatchRequest<TRequest, TResponse> {
  data: TRequest
  url: string
  method: 'PATCH'
  headers?: Headers
}
export interface PutRequest<TRequest, TResponse> {
  data: TRequest
  url: string
  method: 'PUT'
  headers?: Headers
}

export type AnyRequest<TResponse> =
  | PutRequest<any, TResponse>
  | PostRequest<any, TResponse>
  | GetRequest<TResponse>
  | DeleteRequest<TResponse>
  | OptionsRequest<TResponse>
  | PatchRequest<any, TResponse>
