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
export type Pet =
  & NewPet
  & {id: number}
export interface NewPet {
  name: string
  tag?: string
}
export interface Error {
  code: number
  message: string
}
export abstract class RequestFactory {
  static findPets({ tags, limit, }: { tags?: Array<string>, limit?: number, }): GetRequest<Array<Pet>> {
    const query = toQuery({ tags, limit })
    return {
      method: 'GET',
      url: `/pets${query}`,
    }
  }
  static addPet({ body, }: { body: NewPet, }): PostRequest<NewPet, Pet> {
    return {
      method: 'POST',
      url: '/pets',
      data: body,
    }
  }
  static findPetById({ id, }: { id: number, }): GetRequest<Pet> {
    return {
      method: 'GET',
      url: `/pets/${id}`,
    }
  }
  static deletePet({ id, }: { id: number, }): DeleteRequest<undefined> {
    return {
      method: 'DELETE',
      url: `/pets/${id}`,
    }
  }
}
