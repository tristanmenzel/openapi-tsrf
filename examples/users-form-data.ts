/* eslint-disable */
import type { GetRequest, PostRequest, PutRequest, PatchRequest, OptionsRequest, DeleteRequest } from 'openapi-tsrf-runtime'
import { toQuery, toFormData } from 'openapi-tsrf-runtime'
export type User = {
  id: number
  email: string
  name: string
  status?: 'Happy'
    | 'Sad'
  phoneNumbers: Array<string>
}
export type Pick_User_email_or_name_or_phoneNumbers_ = {
  email: string
  name: string
  phoneNumbers: Array<string>
}
export type UserCreationParams = Pick_User_email_or_name_or_phoneNumbers_
export abstract class RequestFactory {
  static getUser({ userId, name, }: { userId: number, name?: string, }): GetRequest<User> {
    const query = toQuery({ name })
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
  static postAvatar({ body, userId, }: { body: { title: string, file: File, }, userId: number, }): PostRequest<FormData, undefined> {
    const formData = toFormData(body)
    return {
      method: 'POST',
      url: `/users/${userId}/avatar`,
      data: formData,
    }
  }
}
