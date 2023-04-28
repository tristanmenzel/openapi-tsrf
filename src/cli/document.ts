import type { Swagger } from './swagger'
import type { AsyncDocumentParts } from './output'
import { DecIndent, IncIndent } from './output'
import { iterateDictionary, methods } from './iteration-helpers'
import {
  generateSchema,
  hasComponentRef,
  resolveParameterReference,
} from './schemas'
import { generateOperation } from './operations'
import { ParsingError } from './ParsingError'

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
          const pathParams = pathObj.parameters?.map(p =>
            hasComponentRef(p)
              ? resolveParameterReference(document, p.$ref)
              : p,
          )
          yield* generateOperation(document, pathStr, method, {
            ...operation,
            parameters: [
              ...(operation.parameters?.map(p =>
                hasComponentRef(p)
                  ? resolveParameterReference(document, p.$ref)
                  : p,
              ) ?? []),
              ...(pathParams ?? []),
            ],
          })
        } catch (error) {
          throw new ParsingError(
            `Failed to generate operation for path ${method}:${pathStr}`,
            error,
          )
        }
      }
    }
    yield DecIndent
    yield '}'
  }
}
