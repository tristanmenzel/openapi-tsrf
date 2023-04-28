/* eslint-disable */
import type { GetRequest, PostRequest, PutRequest, PatchRequest, OptionsRequest, DeleteRequest } from 'openapi-tsrf-runtime'
import { toQuery, toFormData } from 'openapi-tsrf-runtime'
export type ObjectWithId = {
  id: number
}
export type Pet = ObjectWithId
  & {
    name: string
    tag?: string
  }
export type Pets = Array<Pet>
export type Error = {
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
  static updatePets({ body, petId, }: { body: Pet, petId: string, }): PutRequest<Pet, undefined> {
    return {
      method: 'PUT',
      url: `/pets/${petId}`,
      data: body,
    }
  }
}
