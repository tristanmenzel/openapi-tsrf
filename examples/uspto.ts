/* eslint-disable */
import type { GetRequest, PostRequest, PutRequest, PatchRequest, OptionsRequest, DeleteRequest } from 'openapi-tsrf-runtime'
import { toQuery, toFormData } from 'openapi-tsrf-runtime'
export interface dataSetList {
  total?: number
  apis?: Array<{apiKey?: string, apiVersionNumber?: string, apiUrl?: string, apiDocumentationUrl?: string}>
}
export abstract class RequestFactory {
  static listDataSets(): GetRequest<dataSetList> {
    return {
      method: 'GET',
      url: '/',
    }
  }
  static listSearchableFields({ dataset, version, }: { dataset: string, version: string, }): GetRequest<string> {
    return {
      method: 'GET',
      url: `/${dataset}/${version}/fields`,
    }
  }
  static performSearch({ body, version, dataset, }: { body: {criteria: string, start?: number, rows?: number}, version: string, dataset: string, }): PostRequest<{criteria: string, start?: number, rows?: number}, Array<{}>> {
    return {
      method: 'POST',
      url: `/${dataset}/${version}/records`,
      data: body,
    }
  }
}
