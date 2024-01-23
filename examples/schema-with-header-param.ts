/* eslint-disable */
import type { GetRequest, PostRequest, PutRequest, PatchRequest, OptionsRequest, DeleteRequest } from 'openapi-tsrf-runtime'
import { toQuery, toFormData, toHeaders } from 'openapi-tsrf-runtime'
export type TransferResponse = { }
export abstract class RequestFactory {
  static getAccountAccountIdTransfers({ acceptVersion, accountId, startDate, endDate, limit, cursor, }: { acceptVersion: '1.0'
    | '1.1', accountId: string, startDate?: string, endDate?: string, limit?: number, cursor?: string, }): GetRequest<{ message: string, nextCursor?: string, data: Array<TransferResponse>, }> {
    const query = toQuery({ startDate, endDate, limit, cursor })
    const headers = toHeaders({ 'Accept-Version': acceptVersion })
    return {
      method: 'GET',
      url: `/account/${accountId}/transfers${query}`,
      headers,
    }
  }
}
