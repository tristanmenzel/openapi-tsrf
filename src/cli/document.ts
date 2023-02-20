import type { Swagger } from './swagger'
import type { AsyncDocumentParts } from './output'
import { DecIndent, IncIndent } from './output'

import { iterateDictionary, methods } from './iteration-helpers'
import { generateSchema } from './schemas'
import { generateOperation } from './operations'
import { notFalsy } from './util'

export function* generateDocumentParts(
  document: Swagger.Spec3,
): AsyncDocumentParts {
  const hasOperations =
    iterateDictionary(document.paths).flatMap(([_, pathObj]) =>
      methods(pathObj).map(([_, operation]) => operation),
    ).length > 0
  if (hasOperations) {
    yield "import type { GetRequest, PostRequest, PutRequest, PatchRequest, OptionsRequest, DeleteRequest } from 'openapi-tsrf-runtime'"
    yield "import { toQuery, toFormData } from 'openapi-tsrf-runtime'"
  }
  for (const [name, schemaObj] of iterateDictionary(
    document.components.schemas,
  )) {
    yield* generateSchema(name, schemaObj)
  }
  if (hasOperations) {
    yield 'export abstract class RequestFactory {'
    yield IncIndent
    for (const [pathStr, pathObj] of iterateDictionary(document.paths)) {
      for (const [method, operation] of methods(pathObj)) {
        try {
          yield* generateOperation(
            pathStr,
            method,
            inlineRefParameters(document, operation),
          )
        } catch (error) {
          throw new Error(
            `Failed to generate operation for path ${method}:${pathStr}`,
            { cause: error },
          )
        }
      }
    }
    yield DecIndent
    yield '}'
  }
}

function inlineRefParameters(
  document: Swagger.Spec3,
  operation: Swagger.Operation3,
): Swagger.Operation3 {
  return {
    ...operation,
    parameters: operation.parameters
      ?.map(p =>
        p.$ref
          ? document.components?.parameters?.[getParameterNameFromRef(p.$ref)]
          : p,
      )
      .filter(notFalsy),
  }
}

function getParameterNameFromRef($ref: string) {
  const parameterPath = '#/components/parameters/'
  if (!$ref.startsWith(parameterPath))
    throw new Error(`Unsupported: $refs must start with ${parameterPath}`)
  return $ref.substring(parameterPath.length)
}
