/* eslint-disable */
import type { GetRequest, PostRequest, PutRequest, PatchRequest, OptionsRequest, DeleteRequest } from 'openapi-tsrf-runtime'
import { toQuery, toFormData, toHeaders } from 'openapi-tsrf-runtime'
export type Pet = (NewPet
  & {
    id: number
  })
export type NewPet = {
  name: string
  tag?: string
}
export type Error = {
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
