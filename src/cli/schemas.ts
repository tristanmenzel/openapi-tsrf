import { iterateDictionary, yieldMap } from './iteration-helpers'
import type { Swagger } from './swagger'
import type { AsyncDocumentParts } from './output'
import {
  DecIndent,
  IncIndent,
  InlineMode,
  NewLine,
  NewLineMode,
  PropertyDelimiter,
  RestoreLineMode,
} from './output'
import { makeSafeTypeIdentifier } from './sanitization'
import { typeCheckerFor } from './util'

export function* generateSchema(
  name: string,
  schema: Swagger.Schema3,
): AsyncDocumentParts {
  const safeName = makeSafeTypeIdentifier(name)

  yield InlineMode
  yield `export type ${safeName} = `
  yield* getSchemaDefinition(schema)
  yield NewLineMode
}

function getSchemaNameFromRef($ref: string) {
  const schemaPath = '#/components/schemas/'
  if (!$ref.startsWith(schemaPath))
    throw new Error(`Unsupported: $refs must start with ${schemaPath}`)
  return makeSafeTypeIdentifier($ref.substring(schemaPath.length))
}

export function* getSchemaDefinition(
  schema: Swagger.Schema3 | Swagger.BaseSchema | undefined,
): AsyncDocumentParts {
  const schema3Checker = typeCheckerFor<Swagger.Schema3>()
  try {
    yield InlineMode
    if (schema === undefined) {
      yield 'unknown'
      return
    }
    if (schema3Checker.hasProp(schema, 'nullable')) {
      const { nullable, ...rest } = schema
      if (nullable) {
        yield 'null | '
        yield* getSchemaDefinition(rest)
        return
      }
    }

    if (schema.$ref) {
      yield getSchemaNameFromRef(schema.$ref)
      return
    }
    if (schema3Checker.hasProp(schema, 'oneOf')) {
      yield IncIndent
      if (schema.oneOf.length > 1) yield '('
      yield* yieldMap(schema.oneOf, getSchemaDefinition, [NewLine, '| '])
      if (schema.oneOf.length > 1) yield ')'
      yield DecIndent
      return
    }
    if (schema3Checker.hasProp(schema, 'allOf')) {
      yield IncIndent
      if (schema.allOf.length > 1) yield '('
      yield* yieldMap(schema.allOf, getSchemaDefinition, [NewLine, '& '])
      if (schema.allOf.length > 1) yield ')'
      yield DecIndent
      return
    }
    if (schema3Checker.hasProp(schema, 'anyOf')) {
      yield IncIndent
      if (schema.anyOf.length > 1) yield '('
      yield* yieldMap(schema.anyOf, getSchemaDefinition, [NewLine, '| '])
      if (schema.anyOf.length > 1) yield ')'
      yield DecIndent
      return
    }
    if (schema.enum) {
      yield IncIndent
      yield* yieldMap(
        schema.enum,
        function* (value) {
          yield typeof value === 'string' ? `'${value}'` : `${value}`
        },
        [NewLine, '| '],
      )
      yield DecIndent
      return
    }

    if (schemaLooksLikeImplicitObjectType(schema)) {
      schema = {
        ...schema,
        type: 'object',
      }
    }

    switch (schema.type) {
      case 'integer':
      case 'number':
        yield 'number'
        return
      case 'boolean':
        yield 'boolean'
        return
      case 'string':
        if (schema.format === 'binary') {
          yield 'File'
          return
        }
        yield 'string'
        return
      case 'array':
        yield 'Array<'
        yield* getSchemaDefinition(schema.items)
        yield '>'
        return
      case 'object':
        const objSchema = schema as Swagger.Schema3
        yield '{'
        yield NewLine
        yield IncIndent
        for (const [propName, propDef] of iterateDictionary(
          objSchema.properties,
        )) {
          yield propName
          if (!objSchema.required?.includes(propName)) yield '?'
          yield ': '
          yield* getSchemaDefinition(propDef)
          yield PropertyDelimiter
        }
        yield DecIndent
        yield '}'
        return
      default:
        throw new Error(
          `Unsupported schema: ${JSON.stringify(schema, undefined, 2)}`,
        )
    }
  } finally {
    yield RestoreLineMode
  }
}

/**
 * Some schemas don't explicitly set type=object, but if they list a set of properties then
 * we should treat them as an object schema
 * @param schema
 */
function schemaLooksLikeImplicitObjectType(
  schema: Swagger.Schema3 | Swagger.BaseSchema,
) {
  const maybeObjSchema = schema as Swagger.Schema3
  return (
    schema.type === undefined &&
    maybeObjSchema.properties !== undefined &&
    Object.keys(maybeObjSchema.properties).length > 0
  )
}
