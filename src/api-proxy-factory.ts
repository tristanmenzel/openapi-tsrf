/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AnyRequest } from './request-types'

export type FuncOrConfigure<T extends Function, TConfig> = T & {
  withConfig(config: TConfig): { execute: T }
}

export type ProxyFor<TFac, TConfig> = ProxyForInternal<
  TFac,
  keyof TFac,
  TConfig
>
export type ProxyForInternal<TFac, TKey extends keyof TFac, TConfig> = {
  [key in TKey]: TFac[key] extends (
    ...args: infer TArgs
  ) => AnyRequest<infer TResponse>
    ? FuncOrConfigure<(...args: TArgs) => Promise<TResponse>, TConfig>
    : TFac[key]
}

export type ProxyForWithRequiredConfig<TFac, TConfig> =
  ProxyForWithRequiredConfigInternal<TFac, keyof TFac, TConfig>
export type ProxyForWithRequiredConfigInternal<
  TFac,
  TKey extends keyof TFac,
  TConfig,
> = {
  [key in TKey]: TFac[key] extends (
    ...args: infer TArgs
  ) => AnyRequest<infer TResponse>
    ? (arg0: TConfig, ...args: TArgs) => Promise<TResponse>
    : TFac[key]
}

export type MakeRequest<TConfig> = <TResponse>(
  request: AnyRequest<TResponse>,
  config: TConfig | undefined,
) => Promise<TResponse>

export class ApiProxyFactory<TConfig = never> {
  constructor(private makeRequest: MakeRequest<TConfig>) {}

  createProxy<TRequestFactory extends object>(
    requestFactory: TRequestFactory,
  ): ProxyFor<TRequestFactory, TConfig> {
    return this.createProxyInternal(requestFactory, false)
  }

  createProxyWithRequiredConfig<TRequestFactory extends object>(
    requestFactory: TRequestFactory,
  ): ProxyForWithRequiredConfig<TRequestFactory, TConfig> {
    return this.createProxyInternal(requestFactory, true)
  }

  private createProxyInternal<TRequestFactory extends object>(
    requestFactory: TRequestFactory,
    firstArgIsConfig: boolean,
  ) {
    const factory = this

    const proxyCache: Record<string, any> = {}

    return new Proxy<TRequestFactory>(requestFactory, {
      get(
        target: TRequestFactory,
        property: string | symbol,
        receiver: any,
      ): any {
        if (
          typeof property === 'string' &&
          typeof target[property as keyof TRequestFactory] === 'function' &&
          property !== 'prototype'
        ) {
          if (proxyCache[property]) return proxyCache[property]

          async function makeRequestIntl(config: TConfig, args: any[]) {
            const requestFactory = Reflect.get(target, property, receiver) as (
              ...args: any[]
            ) => AnyRequest<any>

            const request = requestFactory(...args)

            try {
              if (firstArgIsConfig) {
                return factory.makeRequest(request, config)
              } else {
                return (factory.makeRequest as any)(request, config)
              }
            } catch (error: unknown) {
              console.error('Api error', error)
              throw error
            }
          }
          function makeRequest(...args: any[]) {
            const [config, otherArgs] = splitConfig(args, firstArgIsConfig)
            return makeRequestIntl(config, otherArgs)
          }

          makeRequest.withConfig = firstArgIsConfig
            ? undefined
            : (config: TConfig) => {
                return {
                  execute: (...args: any[]) => {
                    return makeRequestIntl(config, args)
                  },
                }
              }

          return (proxyCache[property] = makeRequest)
        }
        return Reflect.get(target, property, receiver)
      },
    }) as any
  }
}

function splitConfig(args: any[], firstArgIsConfig: boolean): [any, any[]] {
  if (!firstArgIsConfig) return [undefined, args]
  return [args[0], args.slice(1)]
}
