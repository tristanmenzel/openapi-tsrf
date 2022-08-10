/* eslint-disable @typescript-eslint/no-unused-vars */
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

export type AnyRequest<TResponse> =
  | PutRequest<any, TResponse>
  | PostRequest<any, TResponse>
  | GetRequest<TResponse>
  | DeleteRequest<TResponse>
  | OptionsRequest<TResponse>
  | PatchRequest<any, TResponse>

export type FuncOrConfigure<T extends Function, TConfig> = T & {
  withConfig(config: TConfig): { execute: T }
}

export type ProxyFor<TFac, TConfig> = ProxyForInternal<TFac, keyof TFac, TConfig>
export type ProxyForInternal<TFac, TKey extends keyof TFac, TConfig> = {
  [key in TKey]: TFac[key] extends (...args: infer TArgs) => AnyRequest<infer TResponse>
    ? FuncOrConfigure<(...args: TArgs) => Promise<TResponse>, TConfig>
    : TFac[key]
}

export type MakeRequest<TConfig> = <TResponse>(
  request: AnyRequest<TResponse>,
  config?: TConfig,
) => Promise<TResponse>

export class ApiProxyFactory<TConfig = never> {
  constructor(private makeRequest: MakeRequest<TConfig>) {}

  createProxy<TRequestFactory extends object>(requestFactory: TRequestFactory) {
    const factory = this

    const proxyCache: Record<string, any> = {}

    return new Proxy<TRequestFactory>(requestFactory, {
      get(target: TRequestFactory, property: string | symbol, receiver: any): any {
        if (
          typeof property === 'string' &&
          typeof target[property as keyof TRequestFactory] === 'function' &&
          property !== 'prototype'
        ) {
          if (proxyCache[property]) return proxyCache[property]

          async function makeRequestIntl(config?: TConfig, ...args: any[]) {
            const requestFactory = Reflect.get(target, property, receiver) as (
              ...args: any[]
            ) => AnyRequest<any>
            const request = requestFactory(...args)

            try {
              return factory.makeRequest(request)
            } catch (error: unknown) {
              console.error('Api error', error)
              throw error
            }
          }
          function makeRequest(...args: any[]) {
            return makeRequestIntl(undefined, ...args)
          }
          makeRequest.withConfig = (config: TConfig) => {
            return {
              execute: (...args: any[]) => makeRequestIntl(config, ...args),
            }
          }

          return (proxyCache[property] = makeRequest)
        }
        return Reflect.get(target, property, receiver)
      },
    }) as any as ProxyFor<typeof requestFactory, TConfig>
  }
}
