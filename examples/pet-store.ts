/* eslint-disable */
import type { GetRequest, PostRequest, PutRequest, PatchRequest, OptionsRequest, DeleteRequest } from 'openapi-tsrf'
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
export interface Pet {
  id: number
  name: string
  tag?: string
}
export type Pets = Array<Pet>
export interface Error {
  code: number
  message: string
}
export abstract class RequestFactory {
  static listPets({ limit, }: { limit?: number, }): GetRequest<Pets> {
    const query = toQuery({ limit })
    return {
      method: 'GET',
      url: `/pets${query}`,
    }
  }
  static createPets({ body, }: { body: Pet, }): PostRequest<Pet, undefined> {
    return {
      method: 'POST',
      url: '/pets',
      data: body,
    }
  }
  static showPetById({ petId, }: { petId: string, }): GetRequest<Pet> {
    return {
      method: 'GET',
      url: `/pets/${petId}`,
    }
  }
}
