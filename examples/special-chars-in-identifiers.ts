/* eslint-disable */
import type { GetRequest, PostRequest, PutRequest, PatchRequest, OptionsRequest, DeleteRequest } from 'openapi-tsrf-runtime'
import { toQuery, toFormData } from 'openapi-tsrf-runtime'
export type Banana = {
  'dot.dot'?: string
  '&^&*\'\"%'?: number
}
export abstract class RequestFactory {
  static getBananas({ includeB1, includeB2, $dollars, arg, }: { includeB1?: boolean, includeB2?: boolean, $dollars?: number, arg?: string, }): GetRequest<Banana> {
    const query = toQuery({ 'include.b1': includeB1, 'include.b2': includeB2, $dollars })
    return {
      method: 'GET',
      url: `/bananas/${arg}${query}`,
    }
  }
}
