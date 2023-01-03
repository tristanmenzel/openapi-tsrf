/* eslint-disable */
import type { GetRequest, PostRequest, PutRequest, PatchRequest, OptionsRequest, DeleteRequest } from 'openapi-tsrf-runtime'
import { toQuery, toFormData } from 'openapi-tsrf-runtime'
export abstract class RequestFactory {
  static getAccountAccountIdTransfers({ accountId, startDate, endDate, limit, cursor, }: { accountId: string, startDate?: string, endDate?: string, limit?: number, cursor?: string, }): GetRequest<{ message: string, nextCursor?: string, data: Array<TransferResponse>, }> {
    const query = toQuery({ startDate, endDate, limit, cursor })
    return {
      method: 'GET',
      url: `/account/${accountId}/transfers${query}`,
    }
  }
}
