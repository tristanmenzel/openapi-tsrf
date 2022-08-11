/* eslint-disable */
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
export const toQuery = (o: {[key: string]: any}): string => {
  const q = Object.keys(o)
    .map(k => ({k, v: o[k]}))
    .filter(x => x.v !== undefined && x.v !== null)
    .map(x => Array.isArray(x.v)
      ? x.v.map(v => `${encodeURIComponent(x.k)}=${encodeURIComponent(v)}`).join('&')
      : `${encodeURIComponent(x.k)}=${encodeURIComponent(x.v)}`)
    .join('&')
  return q ? `?${q}` : ''
}
export const toFormData = (o: Record<string, any>): FormData => {
  const fd = new FormData()
  Object.entries(o).forEach(([key, data]) => fd.append(key, data))
  return fd
}
export interface User {
  id: number
  email: string
  name: string
  status?: 'Happy' | 'Sad'
  phoneNumbers: Array<string>
}
export interface Pick_User_email_or_name_or_phoneNumbers_ {
  email: string
  name: string
  phoneNumbers: Array<string>
}
export type UserCreationParams = Pick_User_email_or_name_or_phoneNumbers_
export abstract class RequestFactory {
  static getUser({ userId, name, }: { userId: number, name?: string, }): GetRequest<User> {
    const query = toQuery({ userId, name })
    return {
      method: 'GET',
      url: `/users/${userId}${query}`,
    }
  }
  static createUser({ body, }: { body: UserCreationParams, }): PostRequest<UserCreationParams, undefined> {
    return {
      method: 'POST',
      url: '/users',
      data: body,
    }
  }
  static getAvatar({ userId, }: { userId: number, }): GetRequest<Blob> {
    return {
      method: 'GET',
      url: `/users/${userId}/avatar`,
    }
  }
  static postAvatar({ body, userId, }: { body: {title: string, file: File}, userId: number, }): PostRequest<FormData, undefined> {
    const formData = toFormData(body)
    return {
      method: 'POST',
      url: `/users/${userId}/avatar`,
      data: formData,
    }
  }
}
