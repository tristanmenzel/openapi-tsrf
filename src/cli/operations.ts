import type { HttpMethod } from './definitions'
import type { Swagger } from './swagger'
import { iterateDictionary } from './iteration-helpers'

import type { AsyncDocumentParts } from './output'
import {
  DecIndent,
  IncIndent,
  InlineMode,
  NewLineMode,
  formatInline,
} from './output'
import {
  getSchemaDefinition,
  hasComponentRef,
  resolveParameterReference,
  resolveRequestReference,
  resolveResponseReference,
} from './schemas'
import {
  isSafeVariableIdentifier,
  makeSafeMethodIdentifier,
  makeSafePropertyIdentifier,
  makeSafeVariableIdentifier,
} from './sanitization'

export function* generateOperation(
  document: Swagger.Spec3,
  path: string,
  method: HttpMethod,
  includeHeaders: string[],
  operation: Swagger.Operation3,
): AsyncDocumentParts {
  yield InlineMode
  const [requestFormat, requestBodyType] = getRequestBodyType()
  const responseBodyType = getResponseBodyType()
  const hasQuery = Boolean(operation.parameters?.some(p => p.in === 'query'))
  const hasHeaders = Boolean(
    operation.parameters?.some(
      p =>
        p.in === 'header' &&
        (includeHeaders.includes(p.name) || includeHeaders.includes('*')),
    ),
  )
  yield `static ${makeSafeMethodIdentifier(
    operation.operationId ?? `${method}_${path}`,
  )}(`
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
      .parameters!.filter(p => p.in === 'query')
      .map(p =>
        isSafeVariableIdentifier(p.name)
          ? p.name
          : `${makeSafePropertyIdentifier(
              p.name,
            )}: ${makeSafeVariableIdentifier(p.name)}`,
      )
      .join(', ')} })`
  }
  if (requestFormat === 'form') {
    yield 'const formData = toFormData(body)'
  }
  yield 'return {'
  yield IncIndent
  yield `method: '${method.toUpperCase()}',`
  yield `url: ${getUrlTemplate(hasQuery)},`
  if (requestFormat === 'json') yield 'data: body,'
  if (requestFormat === 'form') yield 'data: formData,'
  if (requestFormat === 'empty') yield 'data: undefined,'
  if (hasHeaders)
    yield `headers: { ${operation
      .parameters!.filter(
        p =>
          p.in === 'header' &&
          (includeHeaders.includes(p.name) || includeHeaders.includes('*')),
      )
      .map(p =>
        isSafeVariableIdentifier(p.name)
          ? p.name
          : `${makeSafePropertyIdentifier(
              p.name,
            )}: ${makeSafeVariableIdentifier(p.name)}`,
      )
      .join(', ')} },`
  yield DecIndent
  yield '}'
  yield DecIndent
  yield '}'

  function* parameters(bodyParamType: string | undefined): AsyncDocumentParts {
    const params =
      operation.parameters?.filter(
        p =>
          p.in === 'path' ||
          p.in === 'query' ||
          (p.in === 'header' &&
            (includeHeaders.includes(p.name) || includeHeaders.includes('*'))),
      ) ?? []
    if (params.length === 0 && bodyParamType === undefined) return

    yield '{ '
    if (bodyParamType) yield 'body, '
    if (params.length)
      yield `${params
        .map(p => makeSafeVariableIdentifier(p.name))
        .join(', ')}, `
    yield '}: { '
    if (bodyParamType) yield `body: ${bodyParamType}, `
    for (const param of params) {
      yield makeSafeVariableIdentifier(param.name)
      if (!param.required) yield '?'
      yield ': '
      if (param.type) yield* getSchemaDefinition(param)
      else yield* getSchemaDefinition(param.schema)
      yield ', '
    }
    yield '}'
  }

  function getUrlTemplate(hasQuery: boolean): string {
    const queryPattern = hasQuery ? '${query}' : ''
    if (path.includes('{')) {
      return `\`${path.replace(
        /\{([^}]+)}/g,
        (_, val) => `$\{${makeSafeVariableIdentifier(val)}}`,
      )}${queryPattern}\``
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
          if (hasComponentRef(operation.requestBody)) {
            operation.requestBody = resolveRequestReference(
              document,
              operation.requestBody.$ref,
            )
          }
          if (operation.requestBody.content['multipart/form-data'])
            return [
              'form',
              formatInline(
                getSchemaDefinition(
                  operation.requestBody.content['multipart/form-data'].schema,
                ),
              ),
            ]
          return [
            'json',
            formatInline(
              getSchemaDefinition(
                operation.requestBody.content?.['application/json']?.schema,
              ),
            ),
          ]
        } else if (operation.parameters?.some(p => p.in === 'body')) {
          return [
            'json',
            formatInline(
              getSchemaDefinition(
                operation.parameters?.find(p => p.in === 'body')?.schema,
              ),
            ),
          ]
        } else {
          return ['empty', undefined]
        }
    }
    return ['na', undefined]
  }

  function getResponseBodyType(): string {
    const [code, responseObjOrRef] = iterateDictionary(
      operation.responses,
    ).find(([code]) => Number(code) >= 200 && Number(code) < 300) ??
      iterateDictionary(operation.responses).find(
        ([code]) => code === 'default',
      ) ?? [undefined, undefined]
    if (code === undefined || code === '203' || !responseObjOrRef)
      return 'undefined'

    const response = hasComponentRef(responseObjOrRef)
      ? resolveResponseReference(document, responseObjOrRef.$ref)
      : responseObjOrRef

    if (
      response.content === undefined ||
      Object.keys(response.content).length === 0
    ) {
      return 'undefined'
    }

    if (response.content['application/json'] === undefined) {
      if (response.content['text/plain'] || response.content['text/html']) {
        return 'string'
      }
      if (response.content['application/octet-stream']) {
        return 'Buffer'
      }
      if (
        Object.values(response.content).some(
          mediaType =>
            mediaType.schema?.type === 'file' ||
            (mediaType.schema?.type === 'string' &&
              ['byte', 'binary'].includes(mediaType.schema?.format!)),
        )
      ) {
        return 'Blob'
      }
    }
    return formatInline(
      getSchemaDefinition(response.content['application/json'].schema),
    )
  }
}
