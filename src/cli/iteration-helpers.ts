import type { Swagger } from './swagger'
import type { HttpMethod } from './definitions'
import type { Part } from './output'
import type { AsyncDocumentParts } from './output'

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
  map: (source: TSource) => AsyncDocumentParts,
  join: Part[] = [],
): AsyncDocumentParts {
  let first = true
  for (const val of source) {
    if (!first) yield* generatorFromParts(join)
    yield* map(val)
    first = false
  }
}

function* generatorFromParts(parts: Part[]): AsyncDocumentParts {
  for (const part of parts) yield part
}
