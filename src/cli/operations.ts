import type { HttpMethod } from './definitions'
import type { Swagger } from './swagger'
import { iterateDictionary } from './iteration-helpers'

import type { AsyncDocumentParts } from './output'
import { DecIndent, IncIndent, InlineMode, NewLineMode } from './output'
import { getTypeName } from './schemas'
import { makeSafeMethodIdentifier } from './sanitization'

export function* generateOperation(
  path: string,
  method: HttpMethod,
  operation: Swagger.Operation3,
): AsyncDocumentParts {
  yield InlineMode
  const [requestFormat, requestBodyType] = getRequestBodyType()
  const responseBodyType = getResponseBodyType()
  const hasQuery = Boolean(operation.parameters?.some(p => p.in === 'query'))
  yield `static ${makeSafeMethodIdentifier(operation.operationId)}(`
  // parameters
  yield* parameters(requestBodyType)
  yield '): '

  switch (method) {
    case 'delete':
      yield 'DeleteRequest<'
      break
    case 'get':
      yield 'GetRequest<'
      break
    case 'put':
      yield 'PutRequest<'
      break
    case 'post':
      yield 'PostRequest<'
      break
    case 'patch':
      yield 'PatchRequest<'
      break
    case 'options':
      yield 'OptionsRequest<'
      break
  }
  // Request body type
  if (requestFormat === 'json' && requestBodyType) yield `${requestBodyType}, `
  if (requestFormat === 'form') yield 'FormData, '
  if (requestFormat === 'empty') yield 'undefined, '
  // Response body type
  yield responseBodyType

  yield '> {'
  yield NewLineMode
  yield IncIndent
  if (hasQuery) {
    yield `const query = toQuery({ ${operation
      .parameters!.map(p => p.name)
      .join(', ')} })`
  }
  if (requestFormat === 'form') {
    yield 'const formData = toFormData(body)'
  }
  yield 'return {'
  yield IncIndent
  yield `method: '${method.toUpperCase()}',`
  yield `url: ${getUrlTemplate(hasQuery)},`
  if (requestFormat === 'json' && requestBodyType) yield 'data: body,'
  if (requestFormat === 'form' && requestBodyType) yield 'data: formData,'
  yield DecIndent
  yield '}'
  yield DecIndent
  yield '}'

  function* parameters(bodyParamType: string | undefined): AsyncDocumentParts {
    const params =
      operation.parameters?.filter(p => p.in === 'path' || p.in === 'query') ??
      []
    if (params.length === 0 && bodyParamType === undefined) return

    yield '{ '
    if (bodyParamType) yield 'body, '
    if (params.length) yield `${params.map(p => p.name).join(', ')}, `
    yield '}: { '
    if (bodyParamType) yield `body: ${bodyParamType}, `
    for (const param of params) {
      yield param.name
      if (!param.required) yield '?'
      yield ': '
      if (param.type) yield getTypeName(param)
      else yield getTypeName(param.schema)
      yield ', '
    }
    yield '}'
  }

  function getUrlTemplate(hasQuery: boolean): string {
    const queryPattern = hasQuery ? '${query}' : ''
    if (path.includes('{')) {
      return `\`${path.replace(/\{[^}]+}/g, val => `$${val}`)}${queryPattern}\``
    }
    return queryPattern ? `\`${path}${queryPattern}\`` : `'${path}'`
  }

  function getRequestBodyType(): [
    'json' | 'form' | 'na' | 'empty',
    string | undefined,
  ] {
    switch (method) {
      case 'put':
      case 'post':
      case 'patch':
        if (operation.requestBody) {
          if (operation.requestBody.content['multipart/form-data'])
            return [
              'form',
              getTypeName(
                operation.requestBody.content['multipart/form-data'].schema,
              ),
            ]
          return [
            'json',
            getTypeName(
              operation.requestBody.content?.['application/json']?.schema,
            ),
          ]
        } else if (operation.parameters?.some(p => p.in === 'body')) {
          return [
            'json',
            getTypeName(
              operation.parameters?.find(p => p.in === 'body')?.schema,
            ),
          ]
        } else {
          return ['empty', undefined]
        }
    }
    return ['na', undefined]
  }

  function getResponseBodyType(): string {
    const [code, response] = iterateDictionary(operation.responses).find(
      ([code]) => Number(code) >= 200 && Number(code) < 300,
    ) ??
      iterateDictionary(operation.responses).find(
        ([code]) => code === 'default',
      ) ?? [undefined, undefined]
    if (code === undefined || code === '203' || response.content === undefined)
      return 'undefined'
    if (response.content['application/json'] === undefined) {
      if (
        Object.values(response.content).some(
          mediaType =>
            mediaType.schema.type === 'file' ||
            (mediaType.schema.type === 'string' &&
              ['byte', 'binary'].includes(mediaType.schema.format!)),
        )
      ) {
        return 'Blob'
      }
    }
    return getTypeName(response.content['application/json'].schema)
  }
}
