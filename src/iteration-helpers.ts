import type { Swagger } from './swagger'
import type { HttpMethod } from './definitions'

export function methods(
  path: Swagger.Path3,
): Array<readonly [HttpMethod, Swagger.Operation3]> {
  const methods: HttpMethod[] = [
    'get',
    'post',
    'put',
    'patch',
    'delete',
    'options',
  ]
  return methods.flatMap(method => {
    const op = path[method]
    return op ? [[method, op] as const] : []
  })
}

type InferDictionaryType<T> = T extends { [key: string]: infer TDictionary }
  ? TDictionary
  : never

export function iterateDictionary<T extends { [key: string]: any }>(
  dictionary: T | undefined,
): Array<readonly [string, InferDictionaryType<T>]> {
  return dictionary ? Object.entries(dictionary) : []
}

export function* yieldMap<TSource, TResult>(
  source: TSource[],
  map: (source: TSource) => TResult,
): Generator<TResult> {
  for (const val of source) {
    yield map(val)
  }
}
