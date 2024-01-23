/* eslint-disable */
import type { GetRequest, PostRequest, PutRequest, PatchRequest, OptionsRequest, DeleteRequest } from 'openapi-tsrf-runtime'
import { toQuery, toFormData, toHeaders } from 'openapi-tsrf-runtime'
export abstract class RequestFactory {
  static getTest(): GetRequest<undefined> {
    return {
      method: 'GET',
      url: '/test',
    }
  }
  static getTest2(): GetRequest<undefined> {
    return {
      method: 'GET',
      url: '/test2',
    }
  }
}
