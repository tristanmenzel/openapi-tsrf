/* eslint-disable */
import type { GetRequest, PostRequest, PutRequest, PatchRequest, OptionsRequest, DeleteRequest } from 'openapi-tsrf-runtime'
import { toQuery, toFormData, toHeaders } from 'openapi-tsrf-runtime'
export type Pet = {
  id: number
  name: string
  tag?: string
}
export type Pets = Array<Pet>
export type Error = {
  code: number
  message: string
}
export abstract class RequestFactory {
  static listPets({ limit, xRocksArePets, }: { limit?: number, xRocksArePets?: boolean, }): GetRequest<Pets> {
    const query = toQuery({ limit })
    const headers = toHeaders({ 'x-rocks-are-pets': xRocksArePets })
    return {
      method: 'GET',
      url: `/pets${query}`,
      headers,
    }
  }
}