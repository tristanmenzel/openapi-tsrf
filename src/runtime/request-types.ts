export interface GetRequest<TResponse> {
  url: string
  method: 'GET'
}
export interface OptionsRequest<TResponse> {
  url: string
  method: 'OPTIONS'
}
export interface DeleteRequest<TResponse> {
  url: string
  method: 'DELETE'
}
export interface PostRequest<TRequest, TResponse> {
  data: TRequest
  url: string
  method: 'POST'
}
export interface PatchRequest<TRequest, TResponse> {
  data: TRequest
  url: string
  method: 'PATCH'
}
export interface PutRequest<TRequest, TResponse> {
  data: TRequest
  url: string
  method: 'PUT'
}

export type AnyRequest<TResponse> =
  | PutRequest<any, TResponse>
  | PostRequest<any, TResponse>
  | GetRequest<TResponse>
  | DeleteRequest<TResponse>
  | OptionsRequest<TResponse>
  | PatchRequest<any, TResponse>
